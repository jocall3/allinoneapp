```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Chat Interface</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7f6;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: #333;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 800px;
            height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #e0e0e0;
        }
        header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            font-size: 1.8em;
            text-align: center;
            border-bottom: 1px solid #388E3C;
            font-weight: bold;
        }
        .api-key-section {
            padding: 15px 20px;
            background-color: #e8f5e9;
            border-bottom: 1px solid #c8e6c9;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
        }
        .api-key-section input[type="text"] {
            flex-grow: 1;
            padding: 10px 15px;
            border: 1px solid #a5d6a7;
            border-radius: 8px;
            font-size: 1em;
            outline: none;
            transition: border-color 0.3s;
        }
        .api-key-section input[type="text"]:focus {
            border-color: #4CAF50;
            box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
        }
        .api-key-section button {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            transition: background-color 0.3s, transform 0.2s;
        }
        .api-key-section button:hover {
            background-color: #43A047;
            transform: translateY(-1px);
        }
        .api-key-section button:active {
            transform: translateY(0);
        }
        .chat-window {
            flex-grow: 1;
            padding: 20px;
            overflow-y: auto;
            background-color: #fcfcfc;
            display: flex;
            flex-direction: column;
            gap: 15px;
            border-bottom: 1px solid #e0e0e0;
        }
        .message {
            display: flex;
            align-items: flex-start;
            max-width: 70%;
            word-wrap: break-word;
            line-height: 1.5;
            padding: 10px 15px;
            border-radius: 18px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .message.user {
            background-color: #DCF8C6;
            align-self: flex-end;
            margin-left: auto;
        }
        .message.ai {
            background-color: #E0E0E0;
            align-self: flex-start;
            margin-right: auto;
        }
        .message .sender {
            font-weight: bold;
            margin-bottom: 5px;
            display: block;
            color: #555;
            font-size: 0.9em;
        }
        .message.user .sender {
            color: #388E3C;
        }
        .message.ai .sender {
            color: #333;
        }
        .message .text {
            white-space: pre-wrap;
            margin-top: 5px; /* Adjust spacing between sender and text if sender is present */
        }
        .input-area {
            display: flex;
            padding: 15px 20px;
            background-color: #ffffff;
            border-top: 1px solid #e0e0e0;
            gap: 10px;
        }
        .input-area input[type="text"] {
            flex-grow: 1;
            padding: 12px 18px;
            border: 1px solid #ccc;
            border-radius: 25px;
            font-size: 1.1em;
            outline: none;
            transition: border-color 0.3s, box-shadow 0.3s;
        }
        .input-area input[type="text"]:focus {
            border-color: #4CAF50;
            box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
        }
        .input-area button {
            padding: 12px 25px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1.1em;
            transition: background-color 0.3s, transform 0.2s;
            white-space: nowrap; /* Prevent button text from wrapping */
        }
        .input-area button:hover {
            background-color: #43A047;
            transform: translateY(-1px);
        }
        .input-area button:active {
            transform: translateY(0);
        }
        .utility-buttons {
            display: flex;
            justify-content: flex-end;
            padding: 10px 20px;
            background-color: #f4f7f6;
            border-top: 1px solid #e0e0e0;
            gap: 10px;
        }
        .utility-buttons button {
            padding: 8px 15px;
            background-color: #757575;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background-color 0.3s;
        }
        .utility-buttons button:hover {
            background-color: #5a5a5a;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                height: 100vh;
                border-radius: 0;
            }
            .message {
                max-width: 85%;
            }
            .api-key-section, .input-area {
                flex-direction: column;
                padding: 10px 15px;
            }
            .api-key-section input[type="text"], .input-area input[type="text"] {
                width: calc(100% - 30px); /* Adjust for padding */
            }
            .api-key-section button, .input-area button {
                width: 100%;
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            AI Chat Assistant
        </header>

        <div class="api-key-section">
            <input type="text" id="apiKeyInput" placeholder="Enter your OpenAI API Key (e.g., sk-YOUR_KEY)">
            <button onclick="saveApiKey()">Save API Key</button>
            <button onclick="clearApiKey()" style="background-color: #f44336;">Clear API Key</button>
        </div>

        <div class="chat-window" id="chatWindow">
            <div class="message ai">
                <span class="sender">AI Assistant</span>
                <span class="text">Hello! I'm your AI assistant. Please enter your API key above to start chatting.</span>
            </div>
        </div>

        <div class="utility-buttons">
            <button onclick="clearChat()">Clear Chat</button>
        </div>

        <div class="input-area">
            <input type="text" id="messageInput" placeholder="Type your message here..." onkeypress="handleKeyPress(event)">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        const API_KEY_STORAGE_KEY = 'openaiApiKey';
        const CHAT_HISTORY_STORAGE_KEY = 'chatHistory';
        const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions'; // Adjust for other models/endpoints if needed
        const DEFAULT_MODEL = 'gpt-3.5-turbo'; // Or 'gpt-4', etc.

        document.addEventListener('DOMContentLoaded', () => {
            loadApiKey();
            loadChatHistory();
            document.getElementById('messageInput').focus();
        });

        function saveApiKey() {
            const apiKeyInput = document.getElementById('apiKeyInput');
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
                alert('API Key saved successfully!');
            } else {
                alert('Please enter a valid API Key.');
            }
        }

        function loadApiKey() {
            const apiKeyInput = document.getElementById('apiKeyInput');
            const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
            if (storedApiKey) {
                apiKeyInput.value = storedApiKey;
            }
        }

        function clearApiKey() {
            if (confirm("Are you sure you want to clear your API Key?")) {
                localStorage.removeItem(API_KEY_STORAGE_KEY);
                document.getElementById('apiKeyInput').value = '';
                alert('API Key cleared.');
            }
        }

        function appendMessage(sender, text) {
            const chatWindow = document.getElementById('chatWindow');
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', sender);

            const senderSpan = document.createElement('span');
            senderSpan.classList.add('sender');
            senderSpan.textContent = sender === 'user' ? 'You' : 'AI Assistant';
            messageDiv.appendChild(senderSpan);

            const textSpan = document.createElement('span');
            textSpan.classList.add('text');
            textSpan.textContent = text;
            messageDiv.appendChild(textSpan);

            chatWindow.appendChild(messageDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to bottom
            saveChatHistory(); // Save after appending
        }

        async function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const userMessage = messageInput.value.trim();

            if (!userMessage) {
                return;
            }

            appendMessage('user', userMessage);
            messageInput.value = ''; // Clear input field

            const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
            if (!apiKey) {
                appendMessage('ai', 'Error: API Key not found. Please enter and save your API key.');
                return;
            }

            // Simulate AI typing/thinking
            const thinkingMessage = appendThinkingMessage();

            try {
                const chatHistory = getChatMessagesForAPI();
                const response = await fetch(OPENAI_API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: DEFAULT_MODEL,
                        messages: [...chatHistory, { role: 'user', content: userMessage }],
                        temperature: 0.7 // Adjust creativity
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error ? errorData.error.message : `API request failed with status ${response.status}`);
                }

                const data = await response.json();
                const aiResponse = data.choices[0].message.content;
                removeThinkingMessage(thinkingMessage);
                appendMessage('ai', aiResponse);

            } catch (error) {
                console.error('Error fetching AI response:', error);
                removeThinkingMessage(thinkingMessage);
                appendMessage('ai', `Error: ${error.message || 'Could not get response from AI. Check your API key or network connection.'}`);
            }
        }

        function appendThinkingMessage() {
            const chatWindow = document.getElementById('chatWindow');
            const thinkingDiv = document.createElement('div');
            thinkingDiv.classList.add('message', 'ai', 'thinking-message'); // Add a specific class
            
            const senderSpan = document.createElement('span');
            senderSpan.classList.add('sender');
            senderSpan.textContent = 'AI Assistant';
            thinkingDiv.appendChild(senderSpan);

            const textSpan = document.createElement('span');
            textSpan.classList.add('text');
            textSpan.innerHTML = '<em>Thinking...</em>'; // Italicize 'Thinking...'
            thinkingDiv.appendChild(textSpan);

            chatWindow.appendChild(thinkingDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            return thinkingDiv; // Return the element to remove it later
        }

        function removeThinkingMessage(element) {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        function saveChatHistory() {
            const chatWindow = document.getElementById('chatWindow');
            const messages = Array.from(chatWindow.children).map(msgDiv => {
                const sender = msgDiv.classList.contains('user') ? 'user' : 'ai';
                const text = msgDiv.querySelector('.text').textContent;
                return { sender, text };
            }).filter(msg => !msg.text.includes('Thinking...')); // Don't save transient thinking messages
            localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages));
        }

        function loadChatHistory() {
            const storedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
            if (storedHistory) {
                const messages = JSON.parse(storedHistory);
                const chatWindow = document.getElementById('chatWindow');
                chatWindow.innerHTML = ''; // Clear initial message
                messages.forEach(msg => appendMessage(msg.sender, msg.text));
            }
        }

        function clearChat() {
            if (confirm("Are you sure you want to clear the entire chat history?")) {
                const chatWindow = document.getElementById('chatWindow');
                chatWindow.innerHTML = `
                    <div class="message ai">
                        <span class="sender">AI Assistant</span>
                        <span class="text">Hello! I'm your AI assistant. Please enter your API key above to start chatting.</span>
                    </div>
                `;
                localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
                alert('Chat history cleared.');
            }
        }

        /**
         * Extracts chat messages from the DOM to form a context for the AI API.
         * OpenAI's Chat Completion API expects messages in the format:
         * `{ role: 'user' | 'assistant', content: 'message text' }`
         * It also typically expects a 'system' message for initial instructions,
         * but for simplicity, we'll just send user/assistant messages.
         */
        function getChatMessagesForAPI() {
            const chatWindow = document.getElementById('chatWindow');
            const messages = Array.from(chatWindow.children)
                .filter(msgDiv => !msgDiv.classList.contains('thinking-message')) // Exclude thinking messages
                .map(msgDiv => {
                    const role = msgDiv.classList.contains('user') ? 'user' : 'assistant';
                    const content = msgDiv.querySelector('.text').textContent;
                    return { role, content };
                })
                .filter(msg => msg.content.trim() !== "Hello! I'm your AI assistant. Please enter your API key above to start chatting."); // Exclude initial welcome message for API context

            // Optionally add a system message at the beginning of the context
            // messages.unshift({ role: 'system', content: 'You are a helpful AI assistant.' });

            return messages;
        }

    </script>
</body>
</html>
```