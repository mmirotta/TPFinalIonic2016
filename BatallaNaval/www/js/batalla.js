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
    $scope.batalla = {};
    $scope.batalla.apuesta = 10;
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
        apuesta: $scope.batalla.apuesta,
        aceptada: false,
        finalizada: false,
        barcoCreador: false,
        barcoAcepta: false,
        usuarioCreador: {nombre:$scope.usuario.nombre, correo:$scope.usuario.correo},
        usuarioAcepta: {nombre:false, correo:false},
        fechaCreacion: fecha,
        clave: "Batalla - " + String(new Date())
      };

      Servicio.Guardar('batalla/' + "Batalla - " + String(new Date()), batalla);

      var reserva = {
        usuario: $scope.usuario.nombre, monto: parseInt($scope.batalla.apuesta), vencido: false
      };

      Servicio.Guardar('reserva/' + $scope.usuario.nombre + '/' + "Batalla - " +  String(new Date()), reserva);
      
      $scope.mensaje.ver = true;
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
    $timeout(function(){
      $scope.imagenes ={
        barco1: "img/barco.png",
        barco2: "img/barco.png",
        barco3: "img/barco.png",
        barco4: "img/barco.png",
        habilitarBarco1: true,
        habilitarBarco2: true,
        habilitarBarco3: true,
        habilitarBarco4: true
      };
      $scope.mensaje = {};
      $scope.mensaje.ver = false;
      $scope.mensaje.resultado = "";
      $scope.batalla = {};
    
      $scope.batalla = JSON.parse($stateParams.batalla);

      console.info($scope.batalla);

      if ($scope.batalla.finalizada == false)
      {
        Servicio.Cargar('/usuario/' + $scope.batalla.usuarioCreador.nombre).on('value',
          function(respuesta) {
            $timeout(function() {
              $scope.usuarioCreador = respuesta.val();
            });
          },
          function(error) {
            // body...
          }
        );

        Servicio.Cargar('/usuario/' + $scope.batalla.usuarioAcepta.nombre).on('value',
          function(respuesta) {
            $timeout(function() {
              $scope.usuarioAcepta = respuesta.val();
            });
          },
          function(error) {
            // body...
          }
        );
      }

      if (($scope.batalla.turno.nombre == FactoryUsuario.Logueado.nombre) || ($scope.batalla.finalizada == true))
      {
        if ($scope.batalla.usuarioCreador.nombre == FactoryUsuario.Logueado.nombre)
        {
          if ($scope.batalla.barcoCreador == false)
          {
            $scope.accion = "Elige la ubicación de tu apuesta";
          }
          else
          {
            if ($scope.batalla.finalizada == true)
            {
              $scope.imagenes.habilitarBarco1 = false;
              $scope.imagenes.habilitarBarco2 = false;
              $scope.imagenes.habilitarBarco3 = false;
              $scope.imagenes.habilitarBarco4 = false;

              $scope.accion = "Resultado: " + $scope.batalla.resultado;
            }
            else
            {
              $scope.accion = "Donde esta la apuesta de " + $scope.batalla.usuarioAcepta.nombre;
            }
            if ($scope.batalla.eleccionCreador != null)
            {
              var arrayEleccionCreador = $scope.batalla.eleccionCreador.split(",");
              for (var i = 0; i < arrayEleccionCreador.length; i++) {
                if (arrayEleccionCreador[i] != " ")
                {
                  switch (arrayEleccionCreador[i])
                  {
                    case "1":
                        if ($scope.batalla.barcoAcepta == 1)
                          $scope.imagenes.barco1 =  "img/barcoHundido.png";
                        else
                          $scope.imagenes.barco1 =  "img/barcoTocado.png";

                        $scope.imagenes.habilitarBarco1 = false;
                      break;
                    case "2":
                        if ($scope.batalla.barcoAcepta == 2)
                          $scope.imagenes.barco2 =  "img/barcoHundido.png";
                        else
                          $scope.imagenes.barco2 =  "img/barcoTocado.png";
                        
                        $scope.imagenes.habilitarBarco2 = false;
                      break;
                    case "3":
                        if ($scope.batalla.barcoAcepta == 3)
                          $scope.imagenes.barco3 =  "img/barcoHundido.png";
                        else
                          $scope.imagenes.barco3 =  "img/barcoTocado.png";

                        $scope.imagenes.habilitarBarco3 = false;
                      break;
                    case "4":
                        if ($scope.batalla.barcoAcepta == 4)
                          $scope.imagenes.barco4 =  "img/barcoHundido.png";
                        else
                          $scope.imagenes.barco4 =  "img/barcoTocado.png";

                        $scope.imagenes.habilitarBarco4 = false;
                      break;
                  }
                }
              };
            }
          }
        }
        else
        {
          if ($scope.batalla.barcoAcepta == false)
          {
            $scope.accion = "Elige la ubicación de tu apuesta";
          }
          else
          {
            if ($scope.batalla.finalizada == true)
            {
              $scope.imagenes.habilitarBarco1 = false;
              $scope.imagenes.habilitarBarco2 = false;
              $scope.imagenes.habilitarBarco3 = false;
              $scope.imagenes.habilitarBarco4 = false;

              $scope.accion = "Resultado: " + $scope.batalla.resultado;
            }
            else
            {
              $scope.accion = "Donde esta la apuesta de " + $scope.batalla.usuarioCreador.nombre;
            }

            if ($scope.batalla.eleccionAcepta != null)
            {
              var arrayEleccionAcepta = $scope.batalla.eleccionAcepta.split(",");
              for (var i = 0; i < arrayEleccionAcepta.length; i++) {
                if (arrayEleccionAcepta[i] != " ")
                {
                  switch (arrayEleccionAcepta[i])
                  {
                    case "1":
                        if ($scope.batalla.barcoCreador == 1)
                          $scope.imagenes.barco1 =  "img/barcoHundido.png";
                        else
                          $scope.imagenes.barco1 =  "img/barcoTocado.png";

                        $scope.imagenes.habilitarBarco1 = false;
                      break;
                    case "2":
                        if ($scope.batalla.barcoCreador == 2)
                          $scope.imagenes.barco2 =  "img/barcoHundido.png";
                        else
                          $scope.imagenes.barco2 =  "img/barcoTocado.png";
                        
                        $scope.imagenes.habilitarBarco2 = false;
                      break;
                    case "3":
                        if ($scope.batalla.barcoCreador == 3)
                          $scope.imagenes.barco3 =  "img/barcoHundido.png";
                        else
                          $scope.imagenes.barco3 =  "img/barcoTocado.png";

                        $scope.imagenes.habilitarBarco3 = false;
                      break;
                    case "4":
                        if ($scope.batalla.barcoCreador == 4)
                          $scope.imagenes.barco4 =  "img/barcoHundido.png";
                        else
                          $scope.imagenes.barco4 =  "img/barcoTocado.png";

                        $scope.imagenes.habilitarBarco4 = false;
                      break;
                  }
                }
              };
            }
          }
        }
      }
      else
      {
        $scope.mensaje.ver = true;
        $scope.mensaje.mensaje = "Es el turno del oponente.";
      }
    });
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en BatallaJugarCtrl. " + error);
  }

  $scope.Elegir = function(parametro){
    try
    {
      var updates = {};
      if ($scope.batalla.turno.creador == true)
      {
        var ronda = parseInt($scope.batalla.turno.ronda);
        if ($scope.batalla.barcoCreador == false)
        {
          updates['/batalla/' + $scope.batalla.clave + '/barcoCreador'] = parametro;
          updates['/batalla/' + $scope.batalla.clave + '/turno'] = {
            nombre:$scope.batalla.usuarioAcepta.nombre, 
            correo:$scope.batalla.usuarioAcepta.correo,
            creador: false,
            ronda:0
          };
          $scope.mensaje.resultado = "Apuesta ubicada. Espere turno oponente.";
        }
        else
        {
          updates['/batalla/' + $scope.batalla.clave + '/turno'] = {
            nombre:$scope.batalla.usuarioAcepta.nombre, 
            correo:$scope.batalla.usuarioAcepta.correo,
            creador: false,
            ronda: ronda,
          };
          if (ronda == 1)
            updates['/batalla/' + $scope.batalla.clave + '/eleccionCreador'] = parametro + ",";
          else
            updates['/batalla/' + $scope.batalla.clave + '/eleccionCreador'] = $scope.batalla.eleccionCreador + parametro + ",";

          if (parseInt(parametro) == parseInt($scope.batalla.barcoAcepta))
          {
            updates['/batalla/' + $scope.batalla.clave + '/creadorAcerto'] = true;
            $scope.mensaje.resultado = "Acertaste. Veremos tu oponente, espera su turno.";
          }
          else
          {
            updates['/batalla/' + $scope.batalla.clave + '/creadorAcerto'] = false;
            $scope.mensaje.resultado = "Fallaste. Veremos tu oponente, espera su turno.";
          }
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
          $scope.mensaje.resultado = "Apuesta ubicada. Espere turno oponente.";
        }
        else
        {
          if (ronda == 2)
            updates['/batalla/' + $scope.batalla.clave + '/eleccionAcepta'] = parametro + ",";
          else
            updates['/batalla/' + $scope.batalla.clave + '/eleccionAcepta'] = $scope.batalla.eleccionAcepta + parametro + ",";
          
          if ($scope.batalla.creadorAcerto == true)
          { 
            if (parseInt(parametro) == parseInt($scope.batalla.barcoCreador))
            {
              updates['/batalla/' + $scope.batalla.clave + '/resultado'] = "Empataron";    
              $scope.mensaje.resultado = "Acertaste, pero tu oponente tambien, Empataron.";
            }
            else
            {
              updates['/batalla/' + $scope.batalla.clave + '/resultado'] = "Ganó " + $scope.batalla.usuarioCreador.nombre;      
              $scope.mensaje.resultado = "Fallaste y tu oponente no, Perdiste.";
              updates['/usuario/' + $scope.batalla.usuarioCreador.nombre + '/saldo'] = parseInt($scope.usuarioCreador.saldo) + parseInt($scope.batalla.apuesta);
              updates['/usuario/' + $scope.batalla.usuarioAcepta.nombre + '/saldo'] = parseInt($scope.usuarioAcepta.saldo) - parseInt($scope.batalla.apuesta);
            }
            updates['/batalla/' + $scope.batalla.clave + '/finalizada'] = true;      
            updates['/reserva/' + $scope.batalla.usuarioCreador.nombre + '/' + $scope.batalla.clave + '/monto'] = 0;
            updates['/reserva/' + $scope.batalla.usuarioCreador.nombre + '/' + $scope.batalla.clave + '/vencido'] = true;
            updates['/reserva/' + $scope.batalla.usuarioAcepta.nombre + '/' + $scope.batalla.clave + '/monto'] = 0;
            updates['/reserva/' + $scope.batalla.usuarioAcepta.nombre + '/' + $scope.batalla.clave + '/vencido'] = true;
          }
          else
          {
            if (parseInt(parametro) == parseInt($scope.batalla.barcoCreador))
            {
              updates['/batalla/' + $scope.batalla.clave + '/resultado'] = "Ganó " + $scope.batalla.usuarioAcepta.nombre;      
              updates['/batalla/' + $scope.batalla.clave + '/finalizada'] = true;
              updates['/usuario/' + $scope.batalla.usuarioCreador.nombre + '/saldo'] = parseInt($scope.usuarioCreador.saldo) - parseInt($scope.batalla.apuesta);
              updates['/usuario/' + $scope.batalla.usuarioAcepta.nombre + '/saldo'] = parseInt($scope.usuarioAcepta.saldo) + parseInt($scope.batalla.apuesta);
              updates['/reserva/' + $scope.batalla.usuarioCreador.nombre + '/' + $scope.batalla.clave + '/monto'] = 0;
              updates['/reserva/' + $scope.batalla.usuarioCreador.nombre + '/' + $scope.batalla.clave + '/vencido'] = true;
              updates['/reserva/' + $scope.batalla.usuarioAcepta.nombre + '/' + $scope.batalla.clave + '/monto'] = 0;
              updates['/reserva/' + $scope.batalla.usuarioAcepta.nombre + '/' + $scope.batalla.clave + '/vencido'] = true;
              $scope.mensaje.resultado = "Acertaste y tu oponente no, Ganaste.";        
            }
            else
            {
              $scope.mensaje.resultado = "Fallaste. Veremos tu oponente, espera su turno.";
              updates['/batalla/' + $scope.batalla.clave + '/turno'] = {
                nombre:$scope.batalla.usuarioCreador.nombre, 
                correo:$scope.batalla.usuarioCreador.correo,
                creador: true,
                ronda: ronda
              };
            }
          }
        }
      }

      Servicio.Editar(updates);   
      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = $scope.mensaje.resultado;
      $timeout(function(){
        $state.go('menu');
      }, 3000);

    }
    catch(error)
    {
      console.info("Ha ocurrido un error en BatallaJugarCtrl-Elige" + error);
    }
  }

  $scope.Menu = function(){
    $state.go("menu");
  }

})
;
