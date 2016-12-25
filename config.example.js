var FileAdapter = require('parse-server-fs-adapter');
var S3Adapter = require('parse-server-s3-adapter');
var GCSAdapter = require('parse-server-gcs-adapter');

module.exports = {
  updatedAt_greaterThan: "2016-12-24T10:06:23.412Z", // 2016-12-23T13:06:37.853Z
  updatedAt_greaterThan_autoUpdateWhenComplete: true,
  //updatedAt_lessThan: "2016-11-29T10:00:00.001Z",

  applicationId: "PARSE_APPLICATION_ID",
  masterKey: "PARSE_MASTER_KEY",
  mongoURL: "mongodb://<username>:<password>@mongourl.com:27017/database_name",
  serverURL: "https://api.customparseserver.com/parse",
  filesToTransfer: 'parseOnly',
  renameInDatabase: false,
  transferTo: 'filesystem',

  // For filesystem configuration
  filesystemPath: './downloaded_files',

  // For S3 configuration
  aws_accessKeyId: "ACCESS_KEY_ID",
  aws_secretAccessKey: "SECRET_ACCESS_KEY",
  aws_bucket: "BUCKET_NAME",
  aws_bucketPrefix: "",

  // For GCS configuration
  gcs_projectId: "GCS_PROJECT_ID",
  gcs_keyFilename: "credentials.json",
  gcs_bucket: "BUCKET_NAME",

  asyncLimit: 10
  // Or set filesAdapter to a Parse Server file adapter
  // filesAdapter: new FileAdapter({
  //  filesSubDirectory: './downloaded_files'
  // }),
  // filesAdapter: new S3Adapter({
  //   accessKey: 'ACCESS_KEY_ID',
  //   secretKey: 'SECRET_ACCESS_KEY',
  //   bucket: 'BUCKET_NAME'
  // }),
  // filesAdapter: new GCSAdapter({
  //   projectId: "GCS_PROJECT_ID",
  //   keyFilename: "credentials.json",
  //   bucket: "BUCKET_NAME",
  // }),
};
