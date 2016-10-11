angular.module('doctor').controller('imageTemplateController', imageTemplateController);
imageTemplateController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', '$timeout', 'SweetAlert'];

function imageTemplateController($scope, $log, doctorServices, $state, $http, $parse, $timeout, SweetAlert) {
    var imageTemplate = this;

    imageTemplate.addImage = addImage;
    imageTemplate.imageName = '';
    imageTemplate.imagesList = [];

    var getImagesPromise = doctorServices.getDoctorImages();
    $log.log('get images promise is-----', getImagesPromise);
    getImagesPromise.then(function(getImagesSuccess) {
        var errorCode = getImagesSuccess.data.errorCode;
        if (errorCode) {
            doctorServices.logoutFromThePage(errorCode);
        } else {
            var getImagesResponse = angular.fromJson(getImagesSuccess.data.response);
            $log.log('images response is---', getImagesResponse);
            if (errorCode == null && getImagesSuccess.data.success) {
                imageTemplate.imagesList = _.filter(getImagesResponse, function(entity) {
                    return entity.state == 'ACTIVE';
                })

            }
        }
    }, function(getImagesError) {
        doctorServices.noConnectivityError();
    });

    function addImage() {
        var imageRequest = {};
        $log.log('file is------', imageTemplate.myFile);
        imageRequest.file = imageTemplate.myFile;
        imageRequest.imageName = imageTemplate.imageName;
        $log.log('req is----', imageRequest);
        var formData = new FormData();
        $log.log('form data is-----', formData);
        /*var output = document.getElementById('output');
        $log.log('oydf--', output);
        output.src = URL.createObjectURL(event.target.files[0]);
        $log.log('output is-----', output, output.src);*/
        var addImagePromise = doctorServices.addImages(imageRequest);
        $log.log('add promise is------', addImagePromise);
        addImagePromise.then(function(addImageSuccess) {
            var errorCode = addImageSuccess.data.errorCode;
            if (errorCode) {
                //doctorServices.logoutFromThePage(errorCode);
            } else {
                var addImageResponse = angular.fromJson(addImageSuccess.data.response);
                $log.log('response is----', addImageResponse);
            }
        }, function(addImageError) {
            //doctorServices.noConnectivityError();
        });
    }
}
