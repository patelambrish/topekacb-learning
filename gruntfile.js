module.exports = function(grunt) {
    grunt.initConfig({
        sass: {
            dev: {
                options: {
                    style: 'compact',
                    compass: false,
                    precision: 8
                },
                files: {
                	'public/assets/css/site.css': 'public/assets/css/site.scss',
                	'public/vendor/font-awesome/css/font-awesome.css': 'public/vendor/font-awesome/scss/font-awesome.scss'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-sass');
    grunt.registerTask('default', ['sass:dev']);
}
