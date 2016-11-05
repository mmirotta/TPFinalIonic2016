angular.module('starter.desafio', [])

.controller('DesafioCtrl', function($scope, $stateParams, $timeout, $state, Servicio) {
  try
    {
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
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en DesafioCrtl. " + error);
  }

  $scope.Guardar = function(){
    try
    {
      var fecha = firebase.database.ServerValue.TIMESTAMP;
      var desafio = {
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
      };

      Servicio.Guardar('desafio/' + $scope.desafio.titulo, desafio);

      var reserva = {
        usuario: $scope.usuario.nombre, monto: parseInt($scope.desafio.apuesta), vencido: false
      };

      Servicio.Guardar('reserva/' + $scope.usuario.nombre + '/' + $scope.desafio.titulo, reserva);

      $state.go('app.salaDesafios');
    }
    catch(error)
    {
      console.info("Ha ocurrido un error al Guardar un desafio. " + error);
    }
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
})

.controller('VerificarDesafiosCtrl', function($scope, $stateParams, $timeout, $state, Servicio) {
  try
  {
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
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en VerificarDesafiosCtrl. " + error);
  }
  $scope.Aceptar = function(eleccion){
      var updateDesafio = {};
      updateDesafio['/desafio/' + $scope.desafio.titulo + '/finalizada'] = true;
      if (eleccion == 'empate')  
      {
        updateDesafio['/desafio/' + $scope.desafio.titulo + '/usuarioGanador'] = false;
        updateDesafio['/desafio/' + $scope.desafio.titulo + '/empate'] = true;
      }
      else
      {
        updateDesafio['/desafio/' + $scope.desafio.titulo + '/usuarioGanador'] = eleccion;
        updateDesafio['/desafio/' + $scope.desafio.titulo + '/empate'] = false;
      }
      
      Servicio.Editar(updateDesafio);

      var usuarioCreadorReserva = {};
      usuarioCreadorReserva['/reserva/' + desafio.usuarioCreador.nombre + '/' + desafio.titulo + '/monto'] = 0;
      usuarioCreadorReserva['/reserva/' + desafio.usuarioCreador.nombre + '/' + desafio.titulo + '/vencido'] = true;
      
      Servicio.Editar(usuarioCreadorReserva);

      var usuarioAceptaReserva = {};
      updateUsuarioReserva['/reserva/' + desafio.ususarioAcepta.nombre + '/' + desafio.titulo + '/monto'] = 0;
      updateUsuarioReserva['/reserva/' + desafio.ususarioAcepta.nombre + '/' + desafio.titulo + '/vencido'] = true;
      
      Servicio.Editar(updateUsuarioReserva);

      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = "Has aceptado la apuesta, suerte.";
  }

  $scope.Volver = function(){
    $state.go('app.verificarDesafios');
  }
});
