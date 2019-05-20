require('dotenv').config()
const chalk = require('chalk')

const {
	getProjects,
	createCard,
	getColumns,
} = require('./services/GitHub.service')

const WebhooksApi = require('@octokit/webhooks')

const isDev = process.env.NODE_ENV !== 'production'

const EventSource = require('eventsource')

const checkEnvVars = () => {
	const requiredVars = [
		'GH_ACCESS_TOKEN',
		'GH_PROJECT_REPO',
		'GH_PROJECT_OWNER',
		'GH_WEBHOOK_SECRET',
		'GH_ISSUE_REPO_OWNER',
		'GH_ISSUE_REPO_NAME',
	]

	const optionalVars = [
		'GH_PROJECT_NAME',
		'GH_PROJECT_COLUMN',
	]

	requiredVars.forEach(variable => {
		if (!process.env[variable]) {
			console.log(chalk.redBright(`Error: Required environment variable ${variable} not found.`))
			process.exit(1)
		}
	})

	optionalVars.forEach(variable => {
		if (!process.env[variable]) {
			console.log(chalk.yellowBright(`Warning: Optional environment variable ${variable} not found, defaulting to first entry in results.`))
		}
	})
}

const getProject = async () => {
	const { data, ok } = await getProjects({
		owner: process.env.GH_PROJECT_OWNER,
		repo: process.env.GH_PROJECT_REPO,
		token: process.env.GH_ACCESS_TOKEN,
	})

	if (!ok) {
		console.log(chalk.redBright(`Error fetching repository: ${data.message}`))
	} else {
		if (data.length <= 0) {
			console.log(chalk.redBright(`No projects found. Application will exit.`))
			process.exit(0)
		}

		let projectData

		if (!process.env.GH_PROJECT_NAME) {
			projectData = data[0]
		} else {
			const projectName = process.env.GH_PROJECT_NAME.toLowerCase()

			let matchingProjects = data.filter(project => project.name.toLowerCase() === projectName)
		
			if (matchingProjects.length <= 0) {
				console.log(chalk.redBright(`No projects found with name ${projectName}. Application will exit.`))
				process.exit(0)
			}

			if (matchingProjects.length > 1) {
				console.warn(chalk.yellowBright(`Multiple projects with name ${projectName} found. Using first occurance.`))
			}

			projectData = matchingProjects[0]
		}

		return projectData
	}
}

const getColumn = async (projectId) => {
	const { data, ok } = await getColumns({
		projectId,
		token: process.env.GH_ACCESS_TOKEN,
	})

	if (!ok) {
		console.log(chalk.redBright(`Error fetching columns: ${data.message}`))
	} else {
		if (data.length <= 0) {
			console.log(chalk.redBright(`No columns found. Application will exit.`))
			process.exit(0)
		}

		let columnData

		if (!process.env.GH_PROJECT_COLUMN) {
			columnData = data[0]
		} else {
			const columnName = process.env.GH_PROJECT_COLUMN.toLowerCase()

			let matchingColumns = data.filter(column => column.name.toLowerCase() === columnName)
		
			if (matchingColumns.length <= 0) {
				console.log(chalk.redBright(`No columns found with name ${columnName}. Application will exit.`))
				process.exit(0)
			}

			if (matchingColumns.length > 1) {
				console.warn(chalk.yellowBright(`Multiple columns with name ${columnName} found. Using first occurance.`))
			}

			columnData = matchingColumns[0]
		}

		return columnData
	}
}

const main = async () => {
	const { id: projectId } = await getProject()

	console.log('Project ID:', projectId)

	const { id: columnId } = await getColumn(projectId)

	console.log('Column ID:', columnId)

	const webhooks = new WebhooksApi({
		secret: process.env.GH_WEBHOOK_SECRET,
	})

	webhooks.on('*', async ({ name, payload }) => {
		if (name === 'issues') {
			const {
				action,
				issue: {
					number: issueNumber,
				},
			} = payload

			if (action === 'opened') {
				const { data, ok } = await createCard({
					columnId,
					token: process.env.GH_ACCESS_TOKEN,
					note: `${process.env.GH_ISSUE_REPO_OWNER}/${process.env.GH_ISSUE_REPO_NAME}#${issueNumber}`,
				})

				if (ok) {
					console.log(chalk.green(`Successfully created card for issue ${issueNumber}`))
				} else {
					console.error(chalk.redBright(`Couldn't create card for issue ${issueNumber}: ${data.message}`))
				}
			}
		}
	})

	if (!isDev) {
		require('http').createServer(webhooks.middleware).listen(3000)
	} else {
		const source = new EventSource(process.env.WEBHOOK_PROXY_URL)

		source.onmessage = (event) => {
			const webhookEvent = JSON.parse(event.data)

			webhooks.verifyAndReceive({
				id: webhookEvent['x-request-id'],
				name: webhookEvent['x-github-event'],
				signature: webhookEvent['x-hub-signature'],
				payload: webhookEvent.body,
			}).catch(console.error)
		}
	}
}

checkEnvVars()

main()