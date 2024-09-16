const core = require('@actions/core')
const { SSMClient, SendCommandCommand } = require('@aws-sdk/client-ssm')
const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2')
const getInstanceId = async instanceName => {
  const ec2Client = new EC2Client({})
  const response = await ec2Client.send(
    new DescribeInstancesCommand({
      Filters: [{ Name: 'tag:Name', Values: [instanceName] }]
    })
  )

  const reservations = response.Reservations
  if (reservations.length === 0 || reservations[0].Instances.length === 0) {
    throw new Error(`No instances found with name: ${instanceName}`)
  }
  return reservations.flatMap(reservation =>
    reservation.Instances.map(instance => instance.InstanceId)
  )
}

const sendCommand = async inputs => {
  const { instanceIds, workingDirectory, commands } = inputs
  const sendCommandInput = {
    InstanceIds: instanceIds,
    DocumentName: 'AWS-RunShellScript',
    Parameters: {
      workingDirectory: [workingDirectory],
      commands
    }
  }

  const client = new SSMClient({})
  const data = await client.send(new SendCommandCommand(sendCommandInput))
  core.debug(`send output: ${JSON.stringify(data)}`)
  return data.Command?.CommandId
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
const run = async () => {
  try {
    const instanceId = core.getInput('instanceId', { required: false })
    const workingDirectory = core.getInput('workingDirectory', {
      required: true
    })
    const instanceName = core.getInput('instanceName', { required: false })
    const commands = core.getMultilineInput('commands', { required: true })
    // const workingDirectory = '/home/ubuntu/ubuntu'
    // const instanceName = 'zipgo-prod-migrated'
    // const command = [
    //   'echo "thisislattrial" > trial.txt',
    //   'cat trial.txt > result.txt'
    // ]
    if (!instanceId && !instanceName) {
      throw new Error('You must provide instance id or instance name.')
    }
    const instanceIds = !instanceId
      ? await getInstanceId(instanceName)
      : [instanceId]
    const commandId = await sendCommand({
      instanceIds,
      workingDirectory,
      commands
    })
    core.setOutput('commandId', commandId)
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
