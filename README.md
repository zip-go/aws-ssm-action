## SSM Send Command Action for GitHub Actions

This action sends commands to an EC2 instance via AWS Systems Manager (SSM). You can use it to execute commands on your EC2 instances directly from your GitHub Actions workflows.


<!-- tocstop -->

## Example of Usage

### Send Commands to an EC2 Instance

#### Before using this action, make sure to include the following:

```yaml
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/my-github-actions-role
          aws-region: us-east-1
```

#### Send commands to an EC2 instance:

```yaml
      - name: Send commands to EC2 instance
        uses: your-github-username/ssm-send-command-action@v1
        with:
          instanceName: my-ec2-instance
          workingDirectory: /path/to/dir
          commands: |
            echo "Hello World"
            ls -la
```

## Inputs

- `instanceId` (optional): The ID of the EC2 instance you want to connect to.
- `instanceName` (optional): The name of the EC2 instance you want to connect to. If both `instanceId` and `instanceName` are provided, `instanceId` takes precedence.
- `workingDirectory` (required): The working directory where you want to execute commands.
- `commands` (required): The commands you want to execute on the instance.

## Outputs

- `commandId`: The ID of the executed command.

## Credentials

This action relies on the [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials.html) to determine AWS credentials and region. Use the [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials) action to configure the GitHub Actions environment with appropriate AWS credentials and region.

```yaml
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/my-github-actions-role
          aws-region: us-east-1
```

### Required Permissions

Ensure that the IAM role or user associated with the AWS credentials has permissions to execute SSM commands.

#### Example

Here’s the example IAM Policy you can use for running this GitHub Action:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeInstances",
                "ssm:SendCommand",
                "ssm:ListCommandInvocations",
                "ssm:DescribeInstanceInformation"
            ],
            "Resource": "*"
        }
    ]
}
```
For details on the required permissions, see the [AWS documentation on SSM](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-ssm-agent.html).

## Troubleshooting

### Command not executing

- Ensure that the `workingDirectory` exists on the instance and that you have proper permissions.
- Verify that the `commands` input is correctly formatted.

