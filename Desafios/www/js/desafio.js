angular.module('starter.desafio', [])

.controller('DesafioCtrl', function($scope, $stateParams, $timeout, $state) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  var referenciaUsuario = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referenciaUsuario.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
    });
  });

  $scope.usuarioReserva = {};
  $scope.usuarioReserva.nombre = usuarioLogeado.displayName;
  $scope.usuarioReserva.monto = 0;
  var referenciaReserva = firebase.database().ref('reserva/' + usuarioLogeado.displayName);
  referenciaReserva.on('value', function(snapshot) {
    $timeout(function() {
      if (snapshot.val() != null)
        $scope.usuarioReserva = snapshot.val();
    });
  });

  $scope.desafio = {};
  $scope.desafio.apuesta = 10;
  $scope.desafio.vencimiento = 1;

  $scope.Guardar = function(){
      var fecha = firebase.database.ServerValue.TIMESTAMP;
      firebase.database().ref('desafio/' + $scope.desafio.titulo).set({
        titulo: $scope.desafio.titulo,
        descripcion: $scope.desafio.descripcion,
        apuesta: $scope.desafio.apuesta,
        vencimiento: $scope.desafio.vencimiento,
        aceptada: false,
        finalizada: false,
        expirada:false,
        usuarioCreador: {nombre:$scope.usuario.nombre, correo:$scope.usuario.correo},
        usuarioAcepta: {nombre:false, correo:false},
        fechaCreacion: fecha
      });

      console.log($scope.usuarioReserva.monto);

      firebase.database().ref('reserva/' + $scope.usuario.nombre + '/' + $scope.desafio.titulo).set({
        usuario: $scope.usuario.nombre, monto: parseInt($scope.desafio.apuesta), vencido: false
      });

      $state.go('app.salaDesafios');
  }
})

.controller('DesafioVerCtrl', function($scope, $stateParams, $timeout, $state) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  $scope.mensaje = {};
  $scope.mensaje.ver = false;
  var referenciaUsuario = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referenciaUsuario.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
    });
  });

  $scope.desafio = {};
  $scope.desafio = JSON.parse($stateParams.desafio);
  $scope.Aceptar = function(){
      var updates = {};
      updates['/desafio/' + $scope.desafio.titulo + '/aceptada'] = true;
      updates['/desafio/' + $scope.desafio.titulo + '/usuarioAcepta'] = {nombre:$scope.usuario.nombre, correo:$scope.usuario.correo};
      updates['/desafio/' + $scope.desafio.titulo + '/fechaAceptada'] = firebase.database.ServerValue.TIMESTAMP;
      
      firebase.database().ref().update(updates);

      firebase.database().ref('reserva/' + $scope.usuario.nombre + '/' + $scope.desafio.titulo).set({
        usuario: $scope.usuario.nombre, monto: parseInt($scope.desafio.apuesta), vencido: false
      });

      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = "Has aceptado la apuesta, suerte.";
  }

  $scope.Volver = function(){
    console.info($scope.desafio);
    if ($scope.desafio.pagina == "salaDesafios")
      $state.go('app.salaDesafios');
    else if ($scope.desafio.pagina == "misDesafios")
      $state.go('app.misDesafios');
  }
});
