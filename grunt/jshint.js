module.exports = {
    files: ['src/*.js'],
    //https://github.com/gruntjs/grunt-contrib-jshint/blob/master/docs/jshint-examples.md
    options: {
        bitwise: false,
        browser: true,
        debug: true,
        devel: true,
        eqeqeq: true,
        evil: true,
        forin: false,
        immed: true,
        loopfunc: false,
        nomen: false,
        onevar: false,
        plusplus: false,
        regexp: false,
        regexdash: true,
        shadow: true,
        strict: true,
        trailing: true,
        undef: true,
        validthis: true,
        white: true,
        predef: ['$']
  }
};