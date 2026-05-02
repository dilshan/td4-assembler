// Instruction set definition.
const INSTRUCTIONS = [
    // mnemonic patterns, opcode nibble, operand type
    { re: /^add\s+a\s*,\s*(.+)$/i, op: 0b0000, type: 'im4', name: 'ADD A, Im' },
    { re: /^mov\s+a\s*,\s*b$/i, op: 0b0001, type: 'none', name: 'MOV A, B' },
    { re: /^in\s+a$/i, op: 0b0010, type: 'none', name: 'IN A' },
    { re: /^mov\s+a\s*,\s*(.+)$/i, op: 0b0011, type: 'im4', name: 'MOV A, Im' },
    { re: /^mov\s+b\s*,\s*a$/i, op: 0b0100, type: 'none', name: 'MOV B, A' },
    { re: /^add\s+b\s*,\s*(.+)$/i, op: 0b0101, type: 'im4', name: 'ADD B, Im' },
    { re: /^in\s+b$/i, op: 0b0110, type: 'none', name: 'IN B' },
    { re: /^mov\s+b\s*,\s*(.+)$/i, op: 0b0111, type: 'im4', name: 'MOV B, Im' },
    { re: /^out\s+b$/i, op: 0b1001, type: 'none', name: 'OUT B' },
    { re: /^out\s+(.+)$/i, op: 0b1011, type: 'im4', name: 'OUT Im' },
    { re: /^jnc\s+(.+)$/i, op: 0b1110, type: 'im4', name: 'JNC Im' },
    { re: /^jmp\s+(.+)$/i, op: 0b1111, type: 'im4', name: 'JMP Im' },
];

function parseImmediate(s) {
    s = s.trim();

    if (/^0b[01]+$/i.test(s)) return { val: parseInt(s.slice(2), 2), ok: true };
    if (/^[01]{4}$/.test(s)) return { val: parseInt(s, 2), ok: true };
    if (/^\d+$/.test(s)) return { val: parseInt(s, 10), ok: true };
    if (/^0x[0-9a-f]+$/i.test(s)) return { val: parseInt(s.slice(2), 16), ok: true };

    return { ok: false };
}

function assemble(source) {
    const lines = source.split('\n');
    const instructions = [];
    const errors = [];

    let instrIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].replace(/;.*$/, '').trim(); // strip comments
        if (!line) continue;

        if (instrIndex >= 16) {
            errors.push({ line: i + 1, msg: `Line ${i + 1}: Program exceeds 16 instructions (TD4 ROM limit)` });
            instrIndex++;
            continue;
        }

        let matched = false;

        for (const instr of INSTRUCTIONS) {
            const m = line.match(instr.re);
            if (!m) continue;
            matched = true;

            let imm = 0;
            if (instr.type === 'im4') {
                const p = parseImmediate(m[1]);
                if (!p.ok) {
                    errors.push({ line: i + 1, msg: `Line ${i + 1}: Invalid immediate value "${m[1]}"` });
                    instrIndex++;
                    break;
                }
                if (p.val < 0 || p.val > 15) {
                    errors.push({ line: i + 1, msg: `Line ${i + 1}: Immediate value ${p.val} out of range (0–15)` });
                    instrIndex++;
                    break;
                }
                imm = p.val;
            }

            const byte = (instr.op << 4) | imm;
            instructions.push({
                addr: instrIndex,
                byte,
                mnem: instr.name.replace('Im', imm),
                srcLine: i + 1,
                raw: line
            });
            instrIndex++;
            break;
        }

        if (!matched) {
            errors.push({ line: i + 1, msg: `Line ${i + 1}: Unknown instruction "${line}"` });
            instrIndex++;
        }
    }

    return { instructions, errors };
}

function buildDipSwitch(byte) {
    const div = document.createElement('div');
    div.className = 'dip-switch';

    for (let k = 0; k < 8; k++) {
        const bit = (byte >> k) & 1;
        const slot = document.createElement('div');
        slot.className = 'switch-slot';

        const topLabel = document.createElement('div');
        topLabel.className = 'switch-label';
        topLabel.textContent = k + 1;

        const body = document.createElement('div');
        body.className = 'switch-body ' + (bit ? 'sw-on' : 'sw-off');

        const track = document.createElement('div');
        track.className = 'switch-track';

        const knob = document.createElement('div');
        knob.className = 'switch-knob';

        const onL = document.createElement('span');
        onL.className = 'sw-on-label';
        onL.textContent = 'ON';
        const offL = document.createElement('span');
        offL.className = 'sw-off-label';
        offL.textContent = 'OF';

        body.appendChild(track);
        body.appendChild(knob);
        body.appendChild(onL);
        body.appendChild(offL);

        const bitVal = document.createElement('div');
        bitVal.className = 'bit-value';
        bitVal.textContent = bit;

        slot.appendChild(topLabel);
        slot.appendChild(body);
        slot.appendChild(bitVal);

        div.appendChild(slot);
    }
    return div;
}

function formatByte(byte) {
    const hi = (byte >> 4).toString(2).padStart(4, '0');
    const lo = (byte & 0xF).toString(2).padStart(4, '0');

    return `<span class="hi">${hi}</span> <span class="lo">${lo}</span>`;
}

function renderOutput(result) {
    const container = document.getElementById('switches-container');
    const instrCount = document.getElementById('instr-count');
    container.innerHTML = '';

    if (result.instructions.length === 0) {
        container.innerHTML = '<div class="empty-state">Enter assembly code above to generate DIP switch positions</div>';
        instrCount.textContent = '0 / 16 instructions';
        return;
    }

    instrCount.textContent = `${result.instructions.length} / 16 instructions`;

    result.instructions.forEach(instr => {
        const row = document.createElement('div');
        row.className = 'instr-row';

        const addr = document.createElement('div');
        addr.className = 'instr-addr';
        addr.textContent = instr.addr.toString(16).toUpperCase().padStart(2, '0') + 'h';

        const mnem = document.createElement('div');
        mnem.className = 'instr-mnem';
        mnem.textContent = instr.mnem;

        const byteSpan = document.createElement('div');
        byteSpan.className = 'instr-byte';
        byteSpan.innerHTML = formatByte(instr.byte);

        const dip = buildDipSwitch(instr.byte);

        row.appendChild(addr);
        row.appendChild(mnem);
        row.appendChild(dip);
        row.appendChild(byteSpan);

        container.appendChild(row);
    });
}

function renderErrors(errors) {
    const box = document.getElementById('error-box');
    const list = document.getElementById('error-list');

    if (errors.length === 0) {
        box.classList.remove('visible');
        return;
    }

    box.classList.add('visible');
    list.innerHTML = errors.map(e =>
        `<div class="error-item">${e.msg}</div>`
    ).join('');
}

function updateLineNumbers() {
    const ta = document.getElementById('editor');
    const ln = document.getElementById('line-nums');
    const lines = ta.value.split('\n');

    ln.textContent = lines.map((_, i) => i + 1).join('\n');
    ln.style.height = ta.offsetHeight + 'px';
    document.getElementById('line-count').textContent =
        lines.filter(l => l.trim() && !l.trim().startsWith(';')).length + ' lines';
}

function syncScroll() {
    const ta = document.getElementById('editor');
    const ln = document.getElementById('line-nums');

    ln.style.transform = 'translateY(' + (-ta.scrollTop) + 'px)';
}

function update() {
    const src = document.getElementById('editor').value;

    updateLineNumbers();
    syncScroll();

    const result = assemble(src);
    
    renderErrors(result.errors);
    renderOutput(result);
}

function toggleRef() {
    document.getElementById('ref-table').classList.toggle('open');
}

const editor = document.getElementById('editor');
editor.addEventListener('scroll', syncScroll);
editor.addEventListener('input', update);
new ResizeObserver(() => { updateLineNumbers(); syncScroll(); }).observe(editor);

// Some example code...
document.getElementById('editor').value =
    `; TD4 Echo input + count example
in b
add b, 1
out b
jmp 0`;

update();