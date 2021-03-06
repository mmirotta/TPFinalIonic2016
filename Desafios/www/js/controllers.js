angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $timeout, Servicio, FactoryUsuario) {
  try
  {
    if (firebase.auth().currentUser != null)
    {
      $timeout(function(){
        $scope.usuario = FactoryUsuario.Logueado;
      });
    }
    else
    {
      $state.go("login");
    }
  }
  catch (error)
  {
    console.info("Ha ocurrido un error en AppCtrl(). " + error);
  }
})

.controller('PerfilCtrl', function($scope, $state, $stateParams, $timeout, FactoryUsuario) {
  try
  {
    if (firebase.auth().currentUser != null)
    {
      $timeout(function() {
        $scope.usuario = FactoryUsuario.Logueado;
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
    }
    else
    {
      $state.go("login");
    }
  }
  catch (error)
  {
    console.info("Ha ocurrido un error en AppCtrl(). " + error);
  }
});
