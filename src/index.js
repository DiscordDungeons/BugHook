require('dotenv').config()
const chalk = require('chalk')

const {
	getProjects,
} = require('./services/GitHub.service')

const checkEnvVars = () => {
	const requiredVars = [
		'GH_SECRET',
		'GH_PROJECT_REPO',
		'GH_PROJECT_OWNER',
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

const main = async () => {
	const { data, ok } = await getProjects({
		owner: process.env.GH_PROJECT_OWNER,
		repo: process.env.GH_PROJECT_REPO,
		token: process.env.GH_SECRET,
	})

	if (!ok) {
		console.log(chalk.redBright(`Error fetching repository: ${data.message}`))
	} else {
		console.log("Got repos", data)

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

		const { id: projectId } = projectData

		console.log("Project ID", projectId)
	}
}

checkEnvVars()

main()