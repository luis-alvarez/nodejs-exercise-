import nock from 'nock';
import example1Response from './cassettes/example1.json' with { type: "json" };
import example2Response from './cassettes/example2.json' with { type: "json" };
import example3Response from './cassettes/example3.json' with { type: "json" };

const apiMock = ({
    filename = 'example1',
} = {
    filename: 'example1',
}) => {
    const responses = new Map([
        ["example1", example1Response],
        ["example2", example2Response],
        ["example3", example3Response],
    ]);

    nock.cleanAll();

    nock('https://shows-remote-api.com').get('/')
        .times(Infinity)
        .reply(200, responses.get(filename))
}

export { apiMock };
