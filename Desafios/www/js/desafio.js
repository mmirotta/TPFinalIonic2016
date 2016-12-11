angular.module('starter.desafio', [])

.controller('DesafioCtrl', function($scope, $stateParams, $timeout, $state, Servicio, FactoryUsuario) {
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
    $scope.mensaje = {};
    $scope.mensaje.ver = false;
    $scope.usuarioReserva = {};
    $scope.usuarioReserva.nombre = $scope.usuario.nombre;
    $scope.usuarioReserva.monto = 0;
    var referenciaReserva = firebase.database().ref('reserva/' + $scope.usuario.nombre);
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
        $scope.ver = true;
        $scope.mensaje.mensaje = "Desafio generado.";
      $timeout(function(){
        $state.go('app.salaDesafios');
      }, 2000);
    }
    catch(error)
    {
      console.info("Ha ocurrido un error al Guardar un desafio. " + error);
    }
  }
})

.controller('DesafioVerCtrl', function($scope, $stateParams, $timeout, $state, Servicio, FactoryUsuario) {
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
    $scope.mensaje = {};
    $scope.mensaje.ver = false;
    $scope.desafio = {};
    $scope.desafio = JSON.parse($stateParams.desafio);
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en DesafioVerCtrl. " + error);
  }

  $scope.Aceptar = function(){
    try
    {
      var updates = {};
      updates['/desafio/' + $scope.desafio.titulo + '/aceptada'] = true;
      updates['/desafio/' + $scope.desafio.titulo + '/usuarioAcepta'] = {nombre:$scope.usuario.nombre, correo:$scope.usuario.correo};
      updates['/desafio/' + $scope.desafio.titulo + '/fechaAceptada'] = firebase.database.ServerValue.TIMESTAMP;
      
      Servicio.Editar(updates);

      var reserva = {
        usuario: $scope.usuario.nombre, monto: parseInt($scope.desafio.apuesta), vencido: false
      };
      Servicio.Guardar('reserva/' + $scope.usuario.nombre + '/' + $scope.desafio.titulo, reserva);
      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = "Has aceptado la apuesta, suerte.";
      $timeout(function(){
        $state.go('app.salaDesafios');
      }, 1000);
    }
    catch(error)
    {
      console.info("Ha ocurrido un error en DesafioCtrl-Aceptar. " + error);
    }
  }

  $scope.Volver = function(){
    try
    {
      if ($scope.desafio.pagina == "salaDesafios")
        $state.go('app.salaDesafios');
      else if ($scope.desafio.pagina == "misDesafios")
        $state.go('app.misDesafios');
    }
    catch(error)
    {
      console.info("Ha ocurrido un error en DesafioCtrl-Volver. " + error);
    }
  }
})

.controller('DesafioVerificarCtrl', function($scope, $stateParams, $timeout, $state, Servicio, FactoryUsuario) {
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
    $scope.usuario = {};
    $scope.mensaje = {};
    $scope.mensaje.ver = false;
    $scope.desafio = {};
    $scope.desafio = JSON.parse($stateParams.desafio);
    Servicio.Cargar('/usuario/' + $scope.desafio.usuarioCreador.nombre).on('value',
      function(respuesta) {
        $timeout(function() {
          $scope.usuarioCreador = respuesta.val();
          console.info($scope.usuarioCreador);
        });
      },
      function(error) {
        // body...
      }
    );

    Servicio.Cargar('/usuario/' + $scope.desafio.usuarioAcepta.nombre).on('value',
      function(respuesta) {
        $timeout(function() {
          $scope.usuarioAcepta = respuesta.val();
          console.info($scope.usuarioAcepta);
        });
      },
      function(error) {
        // body...
      }
    );
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en DesafioVerificarCtrl. " + error);
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
        if (eleccion == 'creador')
        {
          updateDesafio['/desafio/' + $scope.desafio.titulo + '/usuarioGanador'] = $scope.usuarioCreador;
          updateDesafio['/usuario/' + $scope.desafio.usuarioCreador.nombre + '/saldo'] = parseInt($scope.usuarioCreador.saldo) + $scope.desafio.apuesta;
          updateDesafio['/usuario/' + $scope.desafio.usuarioAcepta.nombre + '/saldo'] = parseInt($scope.usuarioAcepta.saldo) - $scope.desafio.apuesta;
        }
        else
        {
          updateDesafio['/desafio/' + $scope.desafio.titulo + '/usuarioGanador'] = $scope.usuarioAcepta;
          updateDesafio['/usuario/' + $scope.desafio.usuarioCreador.nombre + '/saldo'] = parseInt($scope.usuarioCreador.saldo) - $scope.desafio.apuesta;
          updateDesafio['/usuario/' + $scope.desafio.usuarioAcepta.nombre + '/saldo'] = parseInt($scope.usuarioAcepta.saldo) + $scope.desafio.apuesta;
        }

        updateDesafio['/desafio/' + $scope.desafio.titulo + '/empate'] = false;

      }

      updateDesafio['/reserva/' + $scope.desafio.usuarioCreador.nombre + '/' + $scope.desafio.titulo + '/monto'] = 0;
      updateDesafio['/reserva/' + $scope.desafio.usuarioCreador.nombre + '/' + $scope.desafio.titulo + '/vencido'] = true;
      updateDesafio['/reserva/' + $scope.desafio.usuarioAcepta.nombre + '/' + $scope.desafio.titulo + '/monto'] = 0;
      updateDesafio['/reserva/' + $scope.desafio.usuarioAcepta.nombre + '/' + $scope.desafio.titulo + '/vencido'] = true;
      
      Servicio.Editar(updateDesafio);
      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = "Desafio verificado.";
      
      $timeout(function(){
        $state.go('app.verificarDesafios');
      }, 1000);
  }

  $scope.Volver = function(){
    $state.go('app.verificarDesafios');
  }
});
