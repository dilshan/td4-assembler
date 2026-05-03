# TD4 CPU Assembler

A lightweight, browser-based assembler utility for the *TD4 4-bit CPU*.

This tool converts human-readable assembly code into the binary DIP switch configurations required to program the TD4 CPU. It removes the tedium of manually calculating bit patterns for the 16-byte ROM, allowing you to iterate on your logic and test your programs faster.

Use the tool here: https://dilshan.github.io/td4-assembler/

The TD4 CPU, featured in [*Kaoru Tonami's* book *How to Build a CPU*](https://book.mynavi.jp/ec/products/detail/id=22065), is a classic educational project for understanding computer architecture at the logic gate level. However, programming it involves setting a 16-byte ROM using physical DIP switches.

This utility automates the assembly process, translating your instructions into a visual "map" you can use to flip the switches on your board correctly.

## How to Use

* Access the tool from this URL: https://dilshan.github.io/td4-assembler/
* Enter your assembly instructions in the text area (e.g., `MOV A, 1`).
* Review the output table which displays the binary/DIP switch positions for addresses 0 through 15.
* Set your physical DIP switches on the TD4 board to match the generated "ON" and "OFF" patterns.

## Supported Instructions

The assembler supports the standard 12 instructions of the TD4 architecture:

* `MOV A, Im` / `MOV B, Im`
* `MOV A, B` / `MOV B, A`
* `ADD A, Im` / `ADD B, Im`
* `IN A` / `IN B`
* `OUT B` / `OUT Im`
* `JNC Im` / `JMP Im`

# Credits

* Original TD4 Concept: [*Kaoru Tonami*, *How to Build a CPU*](https://book.mynavi.jp/ec/products/detail/id=22065).
* Official Support Site: [*Mynavi Publishing*](https://book.mynavi.jp/supportsite/detail/4839909865.html)