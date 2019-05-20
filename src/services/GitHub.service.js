const fetch = require('node-fetch')

const getProjects = ({ owner, repo, token }) => fetch(`https://api.github.com/repos/${owner}/${repo}/projects`, {
	headers: {
		'Accept': 'application/vnd.github.inertia-preview+json',
		'Authorization': `token ${token}`,
	},
}).then(async r => ({
	data: await r.json(),
	statusCode: r.status,
	statusText: r.statusText,
	ok: r.ok,
}))

module.exports = {
	getProjects,
}
