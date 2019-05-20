const fetch = require('node-fetch')

const baseURL = 'https://api.github.com'

const getProjects = ({ owner, repo, token }) => fetch(`${baseURL}/repos/${owner}/${repo}/projects`, {
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

const getColumns = ({ projectId, token }) => fetch(`${baseURL}/projects/${projectId}/columns`, {
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

const createCard = ({
	columnId,
	token,
	note,
}) => fetch(`${baseURL}/projects/columns/${columnId}/cards`, {
	method: 'POST',
	headers: {
		'Accept': 'application/vnd.github.inertia-preview+json',
		'Authorization': `token ${token}`,
	},
	body: JSON.stringify({
		note,
	}),
}).then(async r => ({
	data: await r.json(),
	statusCode: r.status,
	statusText: r.statusText,
	ok: r.ok,
}))

module.exports = {
	getProjects,
	getColumns,
	createCard,
}
