This is a serverless implementation of PyCB with simple web interface and AWS lambda.
PyCB is a toolkit for modeling successive ionization of ions trapped in electron beams.
PyCB is available in a separate repository [repository](https://github.com/AndyShor/PyCB) with full set of features, tests and information.
This repository containes a simulation core of PyCB, an AWS lambda function acting as a serverless backend, and
static (html,css, js) client side web interface for hosting on AWS S3. Bound vie AWS API Gateway the components
provide a self contained serverless tool working in the following scheme: 

![short scheme](/images/short_scheme.PNG)

The screenshot gives impression of the front end

![screenshot](/images/pycb_demo_screenshot.png)

More details about setting up AWS for this project can be found in a blog post [blog post](https://andrey-shornikov.medium.com/serverless-number-crunching-cefbfe42d1c3)
