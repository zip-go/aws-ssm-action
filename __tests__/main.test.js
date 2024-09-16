const core = require('@actions/core')
const main = require('../src/main')
const { SSMClient } = require('@aws-sdk/client-ssm')
const { EC2Client } = require('@aws-sdk/client-ec2')

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock AWS SDK clients
jest.mock('@aws-sdk/client-ec2', () => ({
  EC2Client: jest.fn(),
  DescribeInstancesCommand: jest.fn()
}))

jest.mock('@aws-sdk/client-ssm', () => ({
  SSMClient: jest.fn(),
  SendCommandCommand: jest.fn()
}))

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches instance ID and sends SSM command', async () => {
    // Mock inputs for instanceName and commands
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'instanceName':
          return 'my-ec2-instance'
        case 'commands':
          return ['echo "Hello World"']
        default:
          return ''
      }
    })

    // Mock EC2 describe instances response
    const mockInstanceId = 'i-1234567890abcdef0'
    EC2Client.prototype.send = jest.fn().mockResolvedValue({
      Reservations: [
        {
          Instances: [{ InstanceId: mockInstanceId }]
        }
      ]
    })

    // Mock SSM send command response
    const mockCommandId = 'abc-123'
    SSMClient.prototype.send = jest.fn().mockResolvedValue({
      Command: { CommandId: mockCommandId }
    })

    // Run the action
    await main.run()

    // Check that the correct output was set
    expect(setOutputMock).toHaveBeenCalledWith('commandId', mockCommandId)
  })

  it('fails if no instanceId or instanceName is provided', async () => {
    // Mock empty inputs
    getInputMock.mockImplementation(name => '')

    await main.run()

    // Expect the action to fail due to missing inputs
    expect(setFailedMock).toHaveBeenCalledWith(
      'You must provide instance id or instance name.'
    )
  })
})
