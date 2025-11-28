# Chapter 35: The TSAL Debugging Spectrometer

The act of creation is invariably followed by the act of refinement. When a spell fails, the alchemist does not discard the formula but seeks to understand the flaw in its casting. So too it is with programs. The most elegant TSAL incantations, upon transmutation into the raw, mechanistic logic of WebAssembly and interaction with the chaotic currents of the JavaScript host, can produce unexpected and often beautiful flaws. To simply call them "bugs" is to miss the point. They are dissonances, echoes of a misunderstanding between realms.

To perceive these dissonances, we required a new kind of scrying glass. A traditional debugger, with its myopic focus on a single realm, is like trying to understand a symphony by listening to a single instrument. It gives you notes, but not the music. You cannot see the friction at the boundary, the subtle semantic decay as a concept crosses from the platonic ideal of TSAL into the rigid memory space of Wasm, and finally into the fluid, event-driven world of the browser.

This need gave rise to the TSAL Debugging Spectrometer (TDS). It is not merely a tool; it is a unified sensorium for observing the life of a program across its entire existential spectrum.

### The Principle of Spectral Cohesion

The TDS operates on a single, core principle: Spectral Cohesion. It posits that every operation, every variable, every function call possesses a unique "spectral signature" that persists and transforms as it traverses the realms. The TDS does not debug three separate environments; it renders the cohesive spectrum of one unified process.

The interface, therefore, is not a series of panels and text-based call stacks. It is an interactive orrery.

-   **The Host Star (JS):** At the center lies the JavaScript host environment, a radiant, pulsing sun. Its event loops are visible as coronal loops, its DOM as a complex, crystalline structure bathed in the star's light.
-   **The Wasm Planet (Wasm):** In tight orbit is the WebAssembly module, a dense, dark world of pure logic. Its linear memory is a visible grid on its surface, glowing with the heat of active data. Function calls are meteoric trails arcing across its face.
-   **The TSAL Moons (TSAL):** Orbiting the Wasm Planet are the moons, each representing a high-level TSAL concept—a type, a process, a stream. They are ethereal, translucent, their internal state represented by shifting colors and patterns.

A single thread of execution is a glowing cord of light, a causal weave, originating from a TSAL moon, passing through the Wasm planet, and finally striking the Host Star to manifest its effect.

### Scrying the Flow: TDS Modalities

Interacting with this orrery is done through several key modalities:

**1. Causal Weaving:** The most fundamental function. By selecting any effect in the JS host—a rendered pixel, a console log, an updated state variable—the TDS can trace its causal weave backward in time and space. The glowing cord highlights its entire journey: from the DOM update, back through the JavaScript function that triggered it, across the FFI boundary, through the specific Wasm instructions that calculated the value, and terminating at the precise line of TSAL source code that expressed the original intent. You do not hunt for the cause; you simply follow the light back to its source.

**2. The Resonance Tuner:** One can "ping" any variable or data structure in any realm. The TDS responds not with a simple value, but with a resonant frequency visualized as a waveform. A pure, stable sine wave indicates a healthy state. But if a TSAL `FixedPoint` number loses precision when cast to a JS `Number`, the wave will show harmonic distortion. A type mismatch across the Wasm boundary creates a dissonant, clashing chord. The nature of the dissonance tells you the nature of the bug.

**3. The Chronoscope:** The timeline is not a linear set of breakpoints. It is a dial that allows the alchemist to scrub through the entire recorded history of the program's execution. As you turn the dial, the orrery animates, showing the flow of data and control. You can pause at any nanosecond and examine the complete, cohesive state of all three realms. It makes ephemeral race conditions and state corruption issues trivial to pinpoint, as one can simply rewind to the moment of inception and watch the flaw unfold.

### A Practical Incantation: The Ghost in the Machine

Consider a simple simulation of falling sand, rendered to a `<canvas>`. A single grain of sand becomes stuck in mid-air—a ghost pixel.

With a traditional debugger, the hunt begins. Is it a rendering bug in the JS? An off-by-one in the Wasm physics update loop? A logic error in the TSAL source? You would be lost in a maze of three disconnected worlds.

With the TDS, the process is one of revelation:

1.  We activate the **Causal Weaver** and click on the errant pixel in the browser.
2.  A thread of faint, sickly green light instantly appears, leading from the pixel back to the Wasm planet. The Orrery rotates to focus on the point of impact: a `store` instruction writing to the shared memory buffer.
3.  We use the **Resonance Tuner** on this memory location. It emits a fractured, stuttering waveform, indicating data corruption. The value is not merely wrong; it is unstable.
4.  We follow the green thread backward from the `store` instruction, watching it trace through the Wasm physics function until it crosses the boundary and enters a TSAL moon labeled `Particle::update_position`.
5.  Now we engage the **Chronoscope**. We rewind time, watching the particle's associated data structure within its moon. Just before the bug manifests, we see a flash—another causal thread, this one a healthy golden color, intersects our particle's data. This other thread originates from a separate TSAL process responsible for user input.
6.  The flaw is revealed. A mouse interaction process was writing to a memory region it had already released, inadvertently corrupting the data for our sand particle mid-flight. The bug wasn't in the physics logic at all; it was a memory lifecycle violation, a phantom interaction between two seemingly unrelated concepts.

The TDS did not help us find a bug. It allowed us to observe the program's holistic truth and see the unexpected, emergent law that governed the flaw's existence. It is the difference between dissecting a corpse and taking a living pulse. It is the foundation of modern digital alchemy.