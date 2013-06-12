module.exports = {
    main: {
        files: [
                {
                expand: true,
                cwd: 'lib/',
                src: ['<%= pkg.name %>.min.js'],
                dest: 'builds/',
                filter: 'isFile',
                    rename: function(dest, src) {
                        return dest + src.replace('.min.js', '.<%= pkg.version %>.min.js');
                    }
                }
        ],
    },
    update: {
        files: [
                {
                expand: true,
                cwd: 'vendors/jquery/',
                src: ['jquery.min.js'],
                dest: 'lib/vendors/'
                },
                {
                expand: true,
                cwd: 'vendors/font-awesome/build/assets/font-awesome/css/',
                src: ['font-awesome.min.css'],
                dest: 'lib/vendors/'
                },
                {
                expand: true,
                cwd: 'vendors/font-awesome/build/assets/font-awesome/font/',
                src: ['fontawesome-webfont.woff'],
                dest: 'lib/font/'
                },
                {
                expand: true,
                cwd: 'vendors/bootstrap/docs/assets/js/',
                src: ['bootstrap.min.js'],
                dest: 'lib/vendors/'
                },
                {
                expand: true,
                cwd: 'vendors/bootstrap/docs/assets/css/',
                src: ['bootstrap-responsive.css'],
                dest: 'lib/vendors/'
                },
                {
                expand: true,
                cwd: 'vendors/bootstrap/docs/assets/css/',
                src: ['bootstrap.css'],
                dest: 'lib/vendors/'
                },
                {
                expand: true,
                cwd: 'vendors/underscore/',
                src: ['underscore-min.js'],
                dest: 'lib/vendors/'
                }
        ]
    },
    website: {
        files: [
                {
                expand: true,
                src: ['lib/**'],
                dest: 'builds/website/'
                },
                {
                expand: true,
                src: ['img/*'],
                dest: 'builds/website/'
                },
                {
                expand: true,
                src: ['*.html'],
                dest: 'builds/website/'
                }
        ]
    }

};