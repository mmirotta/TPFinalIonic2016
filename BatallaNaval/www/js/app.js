// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 
  'starter.controllers', 
  'starter.login',
  'starter.servicio',
  'starter.factoryUsuario',
  'starter.batalla',
  'starter.batallas'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('menu', {
    url: '/menu',
    templateUrl: 'templates/menu.html',
    controller: 'MenuCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('registro', {
    url: '/registro',
    templateUrl: 'templates/registro.html',
    controller: 'RegistroCtrl'
  })

  .state('listaUsuarios', {
    url: '/listaUsuarios',
    templateUrl: 'templates/listaUsuarios.html',
    controller: 'ListaUsuariosCtrl'
  })

  .state('verUsuario', {
    url: '/verUsuario/:usuario',
    templateUrl: 'templates/verUsuario.html',
    controller: 'VerUsuarioCtrl'
  })

  .state('perfil', {
    url: '/perfil',
    templateUrl: 'templates/perfil.html',
    controller: 'PerfilCtrl'
  })

  .state('nuevaBatalla', {
    url: '/nuevaBatalla',
    templateUrl: 'templates/nuevaBatalla.html',
    controller: 'NuevaBatallaCtrl'
  })

  .state('salaBatallas', {
    url: '/salaBatallas',
    templateUrl: 'templates/salaBatallas.html',
    controller: 'SalaBatallasCtrl'
  })  

  .state('batallaVer', {
    url: '/batallaVer/:batalla',
    templateUrl: 'templates/batallaVer.html',
    controller: 'BatallaVerCtrl'
  })

  .state('misBatallas', {
    url: '/misBatallas',
    templateUrl: 'templates/misBatallas.html',
    controller: 'MisBatallasCtrl'
  })  

  .state('batallaJugar', {
    url: '/batallaJugar/:batalla',
    templateUrl: 'templates/batallaJugar.html',
    controller: 'BatallaJugarCtrl'
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
