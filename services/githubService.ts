// @ts-ignore
import { Octokit } from "https://esm.sh/octokit@4.0.2";
import type { Repo, FileNode, User } from '../types.ts';
import { logEvent, logError, measurePerformance } from './telemetryService';

let octokit: Octokit | null = null;

export const initializeOctokit = (token: string) => {
  if (token) {
    octokit = new Octokit({ auth: token });
  } else {
    octokit = null;
  }
};

export const getOctokit = (): Octokit => {
    if (!octokit) {
        throw new Error("Octokit has not been initialized. Please connect to GitHub first.");
    }
    return octokit;
};

export const validateToken = async (token: string): Promise<User> => {
    const tempOctokit = new Octokit({ auth: token });
    const { data: user } = await tempOctokit.request('GET /user');
    return user as User;
};

export const logout = async (): Promise<void> => {
    octokit = null;
    return Promise.resolve();
};


// --- Repository-Level Functions ---

export const getRepos = async (): Promise<Repo[]> => {
    return measurePerformance('getRepos', async () => {
        logEvent('getRepos_start');
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /user/repos', {
                type: 'owner',
                sort: 'updated',
                per_page: 100,
            });
            logEvent('getRepos_success', { count: data.length });
            return data as Repo[];
        } catch (error) {
            logError(error as Error, { context: 'getRepos' });
            throw new Error(`Failed to fetch repositories: ${(error as Error).message}`);
        }
    });
};

export const deleteRepo = async (owner: string, repo: string): Promise<void> => {
     return measurePerformance('deleteRepo', async () => {
        logEvent('deleteRepo_start', { owner, repo });
        try {
            const octokit = getOctokit();
            await octokit.request('DELETE /repos/{owner}/{repo}', {
                owner,
                repo,
            });
            logEvent('deleteRepo_success', { owner, repo });
        } catch (error) {
            logError(error as Error, { context: 'deleteRepo', owner, repo });
            throw new Error(`Failed to delete repository: ${(error as Error).message}`);
        }
    });
};

// --- File and Tree Functions ---

export const getRepoTree = async (owner: string, repo: string): Promise<FileNode> => {
     return measurePerformance('getRepoTree', async () => {
        logEvent('getRepoTree_start', { owner, repo });
        try {
            const octokit = getOctokit();
            const { data: repoData } = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });
            const defaultBranch = repoData.default_branch;
            const { data: branch } = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', { owner, repo, branch: defaultBranch });
            const treeSha = branch.commit.commit.tree.sha;
            
            const { data: treeData } = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
                owner,
                repo,
                tree_sha: treeSha,
                recursive: 'true',
            });

            const root: FileNode = { 
                id: repo,
                name: repo, 
                isDirectory: true,
                path: repo, 
                parentId: null,
                size: 0,
                modified: Date.now(),
                children: [] 
            };
            
            treeData.tree.forEach((item: any) => {
                if (!item.path) return;
                const pathParts = item.path.split('/');
                let currentNode = root;

                pathParts.forEach((part, index) => {
                    if (!currentNode.children) {
                        currentNode.children = [];
                    }
                    let childNode = currentNode.children.find(child => child.name === part);

                    if (!childNode) {
                        const isLastPart = index === pathParts.length - 1;
                        childNode = {
                            id: item.path,
                            name: part,
                            path: item.path,
                            isDirectory: isLastPart ? (item.type === 'tree') : true,
                            parentId: currentNode.path,
                            size: item.size || 0,
                            modified: Date.now(), // GitHub API doesn't provide this in the tree view
                        };
                        if(childNode.isDirectory) childNode.children = [];
                        if (!currentNode.children) {
                            currentNode.children = [];
                        }
                        currentNode.children.push(childNode);
                    }
                    currentNode = childNode;
                });
            });

            logEvent('getRepoTree_success', { owner, repo, items: treeData.tree.length });
            return root;
        } catch (error) {
            logError(error as Error, { context: 'getRepoTree', owner, repo });
            throw new Error(`Failed to fetch repository tree: ${(error as Error).message}`);
        }
    });
};

export const getFileContent = async (owner: string, repo: string, path: string): Promise<string> => {
    return measurePerformance('getFileContent', async () => {
        logEvent('getFileContent_start', { owner, repo, path });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner,
                repo,
                path,
            });

            if (Array.isArray(data) || data.type !== 'file' || typeof data.content !== 'string') {
                 throw new Error("Path did not point to a valid file or content was missing.");
            }

            // The content is Base64 encoded, so we need to decode it.
            const content = atob(data.content);
            logEvent('getFileContent_success', { owner, repo, path, size: content.length });
            return content;
        } catch (error) {
             logError(error as Error, { context: 'getFileContent', owner, repo, path });
             throw new Error(`Failed to fetch file content for "${path}": ${(error as Error).message}`);
        }
    });
};

// --- Commit and Branching Functions ---

export const commitFiles = async (
    owner: string,
    repo: string,
    files: { filePath: string; content: string }[],
    message: string,
    branch: string = 'main'
): Promise<string> => {
    return measurePerformance('commitFiles', async () => {
        logEvent('commitFiles_start', { owner, repo, fileCount: files.length, branch });
        const octokit = getOctokit();

        try {
            // 1. Get the latest commit SHA and base tree SHA
            const { data: refData } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
                owner,
                repo,
                ref: `heads/${branch}`,
            });
            const latestCommitSha = refData.object.sha;
            const { data: commitData } = await octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
                owner,
                repo,
                commit_sha: latestCommitSha,
            });
            const baseTreeSha = commitData.tree.sha;

            // 2. Create blobs for all new file contents
            const blobPromises = files.map(file =>
                octokit.request('POST /repos/{owner}/{repo}/git/blobs', {
                    owner,
                    repo,
                    content: file.content,
                    encoding: 'utf-8',
                })
            );
            const blobs = await Promise.all(blobPromises);
            
            // 3. Create the tree object
            const tree = blobs.map((blob, index) => ({
                path: files[index].filePath,
                mode: '100644' as const, // file mode
                type: 'blob' as const,
                sha: blob.data.sha,
            }));

            // 4. Create a new tree
            const { data: newTree } = await octokit.request('POST /repos/{owner}/{repo}/git/trees', {
                owner,
                repo,
                base_tree: baseTreeSha,
                tree,
            });

            // 5. Create a new commit
            const { data: newCommit } = await octokit.request('POST /repos/{owner}/{repo}/git/commits', {
                owner,
                repo,
                message,
                tree: newTree.sha,
                parents: [latestCommitSha],
            });

            // 6. Update the branch reference (fast-forward)
            await octokit.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
                owner,
                repo,
                ref: `heads/${branch}`,
                sha: newCommit.sha,
            });

            logEvent('commitFiles_success', { commitUrl: newCommit.html_url });
            return newCommit.html_url;

        } catch (error) {
            logError(error as Error, { context: 'commitFiles', owner, repo, branch });
            throw new Error(`Failed to commit files: ${(error as Error).message}`);
        }
    });
};