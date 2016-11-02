angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $timeout) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  var referencia = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referencia.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
    });
  });
})

.controller('PerfilCtrl', function($scope, $stateParams, $timeout) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  var referencia = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referencia.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
      $scope.usuarioReserva = {};
      var referenciaReserva = firebase.database().ref('reserva/' + $scope.usuario.nombre);
      referenciaReserva.on('child_added', function (snapshot) {
        $timeout(function() {
          if (snapshot.val() != null)
          {
            $scope.usuarioReserva = snapshot.val();
            $scope.usuario.saldo = parseInt($scope.usuario.saldo) - parseInt($scope.usuarioReserva.monto);
          }
        });
      });
    });
  });
});
