import * as fs from 'fs';

const readFileFromPath = ({
    path
}) => {
    try {
        return fs.readFileSync(path, 'utf8');
    } catch (error) {
        console.error(error);
    }
};

export { readFileFromPath };
