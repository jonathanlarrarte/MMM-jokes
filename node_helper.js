/* Magic Mirror
 * Node Helper: Jokes
 *
 * Tesis Smart Mirror
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');
var validUrl = require('valid-url');

var validAPIs = ["ticndb", "tambal"];
var apiUrls = ["http://api.icndb.com/jokes/random", "http://tambal.azurewebsites.net/joke/random"];

var JokeFetcher = function(url, api, reloadInterval) {
    var self = this;

    var reloadTimer = null;
    var joke = '';

    var fetchFailedCallback = function() {};
    var eventsReceivedCallback = function() {};

    /* fetchJoke()
     * Initiates joke fetch.
     */
    var fetchJoke = function() {

        clearTimeout(reloadTimer);
        reloadTimer = null;

        //console.log('Getting data: ' + url);

        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log('Jokes_Helper: '+ body);
                var data = JSON.parse(body);
                //console.log(data);
                //console.log(api);
                switch (api){
                    case "ticndb":
                        joke = data.value.joke; //TODO custom fields
                        break;
                    case "tambal":
                        joke = data.joke;
                        break;
                    case "webknox":
                        joke = data.joke;
                        break;
                }
                //console.log('got data: '+ joke);
                self.broadcastEvents();
                scheduleTimer();
            } else {
                //console.error("Jokes_Helper: Could not load Jokes.");
                console.error("Jokes_Helper: Could not load Jokes, HTTP:"  + response.statusCode);
                scheduleTimer();
            }
        });


    };

   
     /* scheduleTimer ()
      * Programe el cronómetro para la próxima actualización.
     */
    var scheduleTimer = function() {
        //console.log('Schedule update timer.');
        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(function() {
            fetchJoke();
        }, reloadInterval);
    };

/* métodos públicos * /

    / * startFetch ()
     * Iniciar startFetch ();
     */
    this.startFetch = function() {
        fetchJoke();
    };

    
/* broadcastItems ()
     * Transmite los eventos existentes.
     */
    this.broadcastEvents = function() {
        if (joke === '') {
            //console.log('No events to broadcast yet.');
            return;
        }
        //console.log('Broadcasting: ' + joke);
        eventsReceivedCallback(self);
    };

   
/* onReceive (devolución de llamada)
     * Establece la devolución de llamada exitosa
     *
     * Función de devolución de llamada de argumento: la devolución de llamada exitosa.
     */
    this.onReceive = function(callback) {
        eventsReceivedCallback = callback;
    };

   
/* onError (devolución de llamada)
     * Establece la devolución de llamada por error
     *
     * función de devolución de llamada de argumento - La devolución de llamada en caso de error.
     */
    this.onError = function(callback) {
        fetchFailedCallback = callback;
    };

   
/* url ()
     * Devuelve la url de este buscador.
     *
     * return string - La url de este buscador.
     */
    this.url = function() {
        return url;
    };

    
/* api ()
     * Devuelve la API de este buscador.
     *
     * return string - La API de este buscador.
     */
    this.api = function() {
        return api;
    };

    
     /* eventos()
     * Devuelve eventos disponibles actuales para este buscador.
     *
     * return array - Los eventos disponibles actuales para este buscador.
     */
    this.joke = function() {
        return joke;
    };

};

module.exports = NodeHelper.create({
    // Override start method.
    start: function() {
        var self = this;
        var joke = '';
        this.fetchers = [];

        console.log('Starting node helper for: ' + this.name);
    },

    // Override socketNotificationReceived method.
    socketNotificationReceived: function(notification, payload) {
        if (notification === 'ADD_JOKE') {
            //console.log('ADD_JOKE: ');
            var apiUrl = apiUrls[0];
            var currentAPI = validAPIs[0];
            for (index = 0; index < validAPIs.length; ++index) {
                if (validAPIs[index] === payload.api){
                    //console.log(validAPIs[index]);
                    apiUrl = apiUrls[index];
                    currentAPI = validAPIs[index];
                }
            }

            this.createFetcher(apiUrl, currentAPI, payload.fetchInterval);
        }
    },

   
/* createFetcher (url, reloadInterval)
     * Crea un buscador para una nueva url si aún no existe.
     * De lo contrario, reutiliza el existente.
     *
     * attribute url string - URL de la fuente de noticias.
     * attribute reloadInterval number - Volver a cargar el intervalo en milisegundos.
     */

    createFetcher: function(url, api, fetchInterval) {
        var self = this;
        //console.log('processing joke fetcher for url: ' + url + ' - Interval: ' + fetchInterval);
        if (!validUrl.isUri(url)){
            self.sendSocketNotification('INCORRECT_URL', {url:url});
            return;
        }

        var fetcher;
        //console.log('processing joke fetcher for url: ' + url + ' - Interval: ' + fetchInterval);
        if (typeof self.fetchers[url] === 'undefined') {
            console.log('Create new joke fetcher for url: ' + url + ' - Interval: ' + fetchInterval);
            fetcher = new JokeFetcher(url, api, fetchInterval);

            fetcher.onReceive(function(fetcher) {
                //console.log('Broadcast events.');
                //console.log(fetcher.events());

                self.sendSocketNotification('JOKE_EVENT', {
                    url: fetcher.url(),
                    joke: fetcher.joke()
                });
            });

            fetcher.onError(function(fetcher, error) {
                self.sendSocketNotification('FETCH_ERROR', {
                    url: fetcher.url(),
                    error: error
                });
            });

            self.fetchers[url] = fetcher;
        } else {
            //console.log('Use exsisting news fetcher for url: ' + url);
            fetcher = self.fetchers[url];
            fetcher.broadcastEvents();
        }

        fetcher.startFetch();
    }
});
