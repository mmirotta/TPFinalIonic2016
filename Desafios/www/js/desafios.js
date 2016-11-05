angular.module('starter.desafios', [])

.controller('SalaDesafiosCtrl', function($scope, $state, $timeout) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  var referenciaUsuario = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referenciaUsuario.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
    });
  });

  $scope.desafios = [];

  var referenciaDesafios = firebase.database().ref('desafio/');
  referenciaDesafios.on('child_added', function (snapshot) {
    $timeout(function() {
      var desafio = snapshot.val();
      desafio.pagina = "salaDesafios";
      if (desafio.aceptada == false && desafio.finalizada == false && desafio.expirada == false) {
        var fecha = new Date(desafio.fechaCreacion)
        var fechaActual = new Date();
        fecha.setHours(fecha.getHours() + desafio.vencimiento);
        if (fecha > fechaActual)
        {
          $scope.desafios.push(desafio);
        }
        else
        {
          var updateDesafio = {};
          updateDesafio['/desafio/' + desafio.titulo + '/expirada'] = true;
          updateDesafio['/desafio/' + desafio.titulo + '/fechaAceptada'] = firebase.database.ServerValue.TIMESTAMP;
          
          firebase.database().ref().update(updateDesafio);

          var updateUsuarioReserva = {};
          updateUsuarioReserva['/reserva/' + desafio.usuarioCreador.nombre + '/' + desafio.titulo + '/monto'] = 0;
          updateUsuarioReserva['/reserva/' + desafio.usuarioCreador.nombre + '/' + desafio.titulo + '/vencido'] = true;
          
          firebase.database().ref().update(updateUsuarioReserva);

          firebase.database()
          .ref('usuario/' + desafio.usuarioCreador.nombre + '/expiradas/' + desafio.titulo).set(desafio);
        }
      }
    });
  });

  $scope.NuevoDesafio = function(){
    $state.go('app.desafio');
  };

  $scope.VerDesafio = function(desafio){
    var param = JSON.stringify(desafio);
    $state.go('app.desafioVer', {desafio:param});
  };
})

.controller('MisDesafiosCtrl', function($scope, $state, $timeout) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  var referenciaUsuario = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referenciaUsuario.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
    });
  });

  $scope.desafios = [];

  var referenciaDesafios = firebase.database().ref('desafio/');
  referenciaDesafios.on('child_added', function (snapshot) {
    $timeout(function() {
      var desafio = snapshot.val();
      desafio.pagina = "misDesafios";
      if (desafio.usuarioCreador.nombre == $scope.usuario.nombre || desafio.usuarioAcepta.nombre == $scope.usuario.nombre)
        $scope.desafios.push(desafio);
    });
  });

  $scope.NuevoDesafio = function(){
    $state.go('app.desafio');
  }

  $scope.VerDesafio = function(desafio){
    var param = JSON.stringify(desafio);
    $state.go('app.desafioVer', {desafio:param});
  }
})

.controller('VerificarDesafiosCtrl', function($scope, $state, $timeout) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  var referenciaUsuario = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referenciaUsuario.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
    });
  });

  $scope.desafios = [];

  var referenciaDesafios = firebase.database().ref('desafio/');
  referenciaDesafios.on('child_added', function (snapshot) {
    $timeout(function() {
      var desafio = snapshot.val();
      desafio.pagina = "verificarDesafios";
      if (desafio.aceptada == true)
      {
        var fecha = new Date(desafio.fechaCreacion)
        var fechaActual = new Date();
        fecha.setHours(fecha.getHours() + desafio.vencimiento);
        if (fecha > fechaActual)
        {
          $scope.desafios.push(desafio);
        }
      }
    });
  });

  $scope.VerDesafio = function(desafio){
    var param = JSON.stringify(desafio);
    $state.go('app.desafioVer', {desafio:param});
  }
});
