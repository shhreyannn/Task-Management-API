module.exports = {
  apps: [{
    name: "task-api",
    script: "./dist/server.js",
    instances: "max", // Utilizes all available CPU cores natively
    exec_mode: "cluster",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
