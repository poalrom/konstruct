const expectedBlocks = ['fields', 'select'];

export function configValidator(config) {
    config.blocks.forEach(validateBlock);
}

function validateBlock(block, i, blocks) {
    if (!expectedBlocks.includes(block.type)) {
        throw new Error('Only expected blocks must be present. Unexpected block has type ' + block.type);
    }
    if (!block.id) {
        throw new Error('All blocks must have ids. Block with index ' + i + ' dont has it');
    }
    if (typeof block.id !== 'string') {
        throw new Error('Block id must be a string');
    }
    if (block.id.indexOf('.') >= 0) {
        throw new Error('Block id must not include dot (.)');
    }
    try {
        hasDuplicates(block, i, blocks);
    } catch (e) {
        throw new Error('Blocks ids must be unique. Not unique id: ' + e.message);
    }
    if (block.type === 'fields') {
        try {
            block.fields.forEach(hasDuplicates);
        } catch (e) {
            throw new Error('Fields ids must be unique. Not unique id: ' + e.message);
        }
    }
}

function hasDuplicates(block, i, blocks) {
    if (blocks.slice(i + 1).some(({id}) => id === block.id)) {
        throw new Error(block.id);
    }
}