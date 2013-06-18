module.exports = {
    min: {
        src: ['src/**/*.js'],
        dest: 'lib/<%= pkg.name %>.min.js'
    },
    build: {
        src: ['src/**/*.js'],
        dest: 'lib/<%= pkg.name %>.js'
    }
};