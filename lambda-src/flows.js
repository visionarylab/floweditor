const signBunny = require('sign-bunny');
const flowsResp = require('../assets/flows.json');

const baseOpts = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
};
const flows = [
    require('../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json'),
    require('../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json'),
    require('../assets/flows/c4ad4218-4bca-4261-a41e-51fdef90595d.json'),
    require('../assets/flows/boring.json')
];
const getOpts = (opts = {}) => Object.assign({}, baseOpts, opts);
const getFlow = uuid => {
    for (const flowResp of flows) {
        if (flowResp.results[0].uuid === uuid) {
            return flowResp;
        }
    }
    return false;
};

const notFoundHandler = cb => cb(null, getOpts({ statusCode: 404, body: signBunny('not found') }));
const flowsHandler = ({ queryStringParameters: query } = {}, cb) => {
    if (Object.keys(query).length > 0) {
        if (query.uuid) {
            const flow = getFlow(query.uuid);
            if (flow) {
                return cb(null, getOpts({ body: JSON.stringify(flow) }));
            }
        }
        return notFoundHandler(cb);
    }
    return cb(null, getOpts({ body: JSON.stringify(flowsResp) }));
};

exports.handler = (evt, ctx, cb) => flowsHandler(evt, cb);