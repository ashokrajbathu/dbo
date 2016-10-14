angular.module('doctor').controller('imageTemplateController', imageTemplateController);
imageTemplateController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', '$timeout', 'SweetAlert'];

function imageTemplateController($scope, $log, doctorServices, $state, $http, $parse, $timeout, SweetAlert) {
    var imageTemplate = this;

    imageTemplate.addImage = addImage;
    imageTemplate.deleteImage = deleteImage;
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

    function deleteImage(imageEntity) {
        $log.log('image to delete is------', imageEntity);
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover Bed Details!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function() {
            imageEntity.state = 'INACTIVE';
            var deleteImagePromise = doctorServices.addImages(imageEntity);
            $log.log('delete image promise ------------', deleteImagePromise);
            deleteImagePromise.then(function(deleteImageSuccess) {
                var errorCode = deleteImageSuccess.data.errorCode;
                if (errorCode) {
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    var deleteImageResponse = angular.fromJson(deleteImageSuccess.data.response);
                    $log.log('delete image response-------', deleteImageResponse);
                }
            }, function(deleteImageError) {
                doctorServices.noConnectivityError();
            });
        });

    }

    function addImage() {
        var imageRequest = {};
        imageRequest.file = imageTemplate.myFile;
        imageRequest.imageName = imageTemplate.imageName;
        var formData = new FormData();
        var addImagePromise = doctorServices.addImages(imageRequest);
        addImagePromise.then(function(addImageSuccess) {
            var errorCode = addImageSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                var addImageResponse = angular.fromJson(addImageSuccess.data.response);
            }
        }, function(addImageError) {
            doctorServices.noConnectivityError();
        });
    }
}
