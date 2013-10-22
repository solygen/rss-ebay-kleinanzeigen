module.exports = {
    options: {
        banner: '/* <%= pkg.name %>.<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) <%= pkg.repository.url %> */'
    },
    dist: {
        src: ['lib/<%= pkg.name %>.min.js'],
        dest: 'builds/<%= pkg.name %>.<%= pkg.version %>.min.js'
    }
};
