module.exports = {
    options: {
        banner: '/* <%= pkg.name %>.<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) <%= pkg.repository.url %> */'
    },
    dist: {
        src: ['<%= concat.js.dest %>'],
        dest: '<%= concat.js.dest %>'
    }
};
