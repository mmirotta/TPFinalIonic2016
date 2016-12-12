angular.module('starter.batalla', [])

.controller('NuevaBatallaCtrl', function($scope, $state, $timeout, Servicio, FactoryUsuario) {
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
    $scope.apuesta = 10;
    $scope.mensaje = {};
    $scope.mensaje.ver = false;
  }
  catch (error)
  {
    console.info("Ha ocurrido un error en MenuCtrl(). " + error);
  }

  $scope.Generar = function(){
    try
    {
      var fecha = firebase.database.ServerValue.TIMESTAMP;
      var batalla = {
        apuesta: $scope.apuesta,
        aceptada: false,
        finalizada: false,
        usuarioCreador: {nombre:$scope.usuario.nombre, correo:$scope.usuario.correo},
        usuarioAcepta: {nombre:false, correo:false},
        fechaCreacion: fecha,
        clave: "Batalla - " + String(new Date())
      };
      console.info(batalla);
      Servicio.Guardar('batalla/' + "Batalla - " + String(new Date()), batalla);

      var reserva = {
        usuario: $scope.usuario.nombre, monto: parseInt($scope.apuesta), vencido: false
      };
      console.info(reserva);
      Servicio.Guardar('reserva/' + $scope.usuario.nombre + '/' + "Batalla - " +  String(new Date()), reserva);
        $scope.ver = true;
        $scope.mensaje.mensaje = "Batalla generada. Espere adversario.";
      $timeout(function(){
        $state.go('menu');
      }, 2000);
    }
    catch (error)
    {
      console.info("Ha ocurrido un error en NuevaBatallaCtrl(). " + error);
    }
  }

  $scope.Menu = function(){
    $state.go("menu");
  }

  $scope.Salir = function(){
    $state.go("login"); 
  }
})
.controller('BatallaVerCtrl', function($scope, $state, $stateParams, $timeout, Servicio, FactoryUsuario) {
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
    $scope.batalla = {};
    $scope.batalla = JSON.parse($stateParams.batalla);
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en BatallaVerCtrl. " + error);
  }

  $scope.Aceptar = function(){
    try
    {
      var updates = {};
      updates['/batalla/' + $scope.batalla.clave + '/aceptada'] = true;
      updates['/batalla/' + $scope.batalla.clave + '/usuarioAcepta'] = {nombre:$scope.usuario.nombre, correo:$scope.usuario.correo};
      updates['/batalla/' + $scope.batalla.clave + '/fechaAceptada'] = firebase.database.ServerValue.TIMESTAMP;
      updates['/batalla/' + $scope.batalla.clave + '/turno'] = {
        nombre:$scope.batalla.usuarioCreador.nombre, 
        correo:$scope.batalla.usuarioCreador.correo,
        creador:true,
        ronda:0
      };
      
      Servicio.Editar(updates);

      var reserva = {
        usuario: $scope.usuario.nombre, monto: parseInt($scope.batalla.apuesta), vencido: false
      };
      Servicio.Guardar('reserva/' + $scope.usuario.nombre + '/' + $scope.batalla.clave, reserva);
      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = "Has aceptado la batalla, suerte.";
      $timeout(function(){
        $state.go('menu');
      }, 1000);
    }
    catch(error)
    {
      console.info("Ha ocurrido un error en BatallaCtrl-Aceptar. " + error);
    }
  }

  $scope.Volver = function(){
    try
    {
      $state.go('salaBatallas');
    }
    catch(error)
    {
      console.info("Ha ocurrido un error en BatallaCtrl-Volver. " + error);
    }
  }

  $scope.Menu = function(){
    $state.go("menu");
  }

  $scope.Salir = function(){
    $state.go("login"); 
  }
})
.controller('BatallaJugarCtrl', function($scope, $state, $stateParams, $timeout, Servicio, FactoryUsuario) {
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
    $scope.batalla = {};
    $scope.batalla = JSON.parse($stateParams.batalla);
    if ($scope.batalla.turno.nombre == FactoryUsuario.Logueado.nombre)
    {
      if ($scope.batalla.turno.creador == true)
      {
        if ($scope.batalla.barcoCreador == false)
          $scope.accion = "Elige la ubicación de tu apuesta";
        else
          $scope.accion = "Donde esta la apuesta de " + $scope.batalla.usuarioAcepta.nombre;
      }
      else
      {
        if ($scope.batalla.barcoAcepta == false)
          $scope.accion = "Elige la ubicación de tu apuesta";
        else
          $scope.accion = "Donde esta la apuesta de " + $scope.batalla.usuarioCreador.nombre;
      }
    }
    else
    {
      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = "Es el turno del oponente.";
    }
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en BatallaJugarCtrl. " + error);
  }

  $scope.Elegir = function(parametro){
    // try
    // {
      var updates = {};
      if ($scope.batalla.turno.creador == true)
      {
        if ($scope.batalla.barcoCreador == false)
        {
          updates['/batalla/' + $scope.batalla.clave + '/barcoCreador'] = parametro;
          updates['/batalla/' + $scope.batalla.clave + '/turno'] = {
            nombre:$scope.batalla.usuarioAcepta.nombre, 
            correo:$scope.batalla.usuarioAcepta.correo,
            creador: false
          };
        }
        else
        {
          updates['/batalla/' + $scope.batalla.clave + '/turno'] = {
            nombre:$scope.batalla.usuarioAcepta.nombre, 
            correo:$scope.batalla.usuarioAcepta.correo,
            creador: false
          };
          updates['/batalla/' + $scope.batalla.clave + '/turno/eleccionCreador'] = parametro;
        }
      }
      else
      {
        var ronda = parseInt($scope.batalla.turno.ronda) + 1;
        if ($scope.batalla.barcoAcepta == false)
        {
          updates['/batalla/' + $scope.batalla.clave + '/barcoAcepta'] = parametro;
          updates['/batalla/' + $scope.batalla.clave + '/turno'] = {
            nombre:$scope.batalla.usuarioCreador.nombre, 
            correo:$scope.batalla.usuarioCreador.correo,
            creador: true,
            ronda: ronda
          };
        }
        else
        {
          updates['/batalla/' + $scope.batalla.clave + '/turno/eleccionAcepta'] = parametro;
          //Verifico
        }
      }

      Servicio.Editar(updates);   
      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = "Elección guardado. Esperando oponente.";
      $timeout(function(){
        $state.go('menu');
      }, 1000);

    // }
    // catch(error)
    // {
    //   console.info("Ha ocurrido un error en BatallaJugarCtrl-Elige" + error);
    // }
  }

  $scope.Volver = function(){
    $state.go('misBatallas');
  }

  $scope.Menu = function(){
    $state.go("menu");
  }

})
;
