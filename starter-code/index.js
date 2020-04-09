const AWS = require('aws-sdk')
const axios = require('axios')

// Name of a service, any string
const serviceName = process.env.SERVICE_NAME
// URL of a service to test
const url = process.env.URL

// CloudWatch client
const cloudwatch = new AWS.CloudWatch();

exports.handler = async (event) => {
  // TODO: Use these variables to record metric values
  let endTime
  let requestWasSuccessful

  // hit a url and calculate elapsed time
  const startTime = timeInMs()
  try {
    await axios.get(url)
    requestWasSuccessful = true
  } catch (error) {
    requestWasSuccessful = false
    console.error(error)
    next(error)
  } finally {
    endTime = timeInMs()
  }

  const totalTime = endTime - startTime

  console.log(`Totaltime to call URL: ${totalTime}`)

  //Record if a response was successful or not
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Success', // Use different metric names for different values, e.g. 'Latency' and 'Successful'
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Count', // 'Count' or 'Milliseconds'
        Value: requestWasSuccessful ? 1 : 0 // Total value
      }
    ],
    Namespace: 'Udacity/Serveless'
  }).promise()

  // write totalTime data point to cloudwatch
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Latency', // Use different metric names for different values, e.g. 'Latency' and 'Successful'
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Milliseconds', // 'Count' or 'Milliseconds'
        Value: totalTime // Total value
      }
    ],
    Namespace: 'Udacity/Serveless'
  }).promise()

  console.log('Metrics recorded in cloudwatch')

}

function timeInMs() {
  return new Date().getTime()
}
