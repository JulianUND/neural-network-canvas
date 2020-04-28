function PerceptronMulticapas(){
    this.layers = [];
    this.error = 0;
}

PerceptronMulticapas.prototype.init = function(inputs, tasaAprendizaje, errorDeseado, pesosMin, pesosMax, limitEpocas){
    this.layers = [];
    
    this.error = 0;
    
    var count = inputs[0].in.length;
    
    this.addLayer(new Layer(count, 2, pesosMin, pesosMax));
    this.addLayer(new Layer(2, 1, pesosMin, pesosMax));
    
    this.train(inputs, tasaAprendizaje, errorDeseado, limitEpocas);
};

PerceptronMulticapas.prototype.predic = function(data){
    this.feedPerceptronFeedFoward(data);
    
    return this.layers[1].neurons[0].activa;
};

PerceptronMulticapas.prototype.feedPerceptronFeedFoward = function(array){
    //La primera capa de la red se alimenta a través de la matriz.
    this.layers[0].feedLayerFeedFowardArray(array);

    //Las demás, son alimentadas por la activación de las neuronas de las capas anteriores.
    for (var c = 1; c < this.layers.length; c++){
        this.layers[c].feedLayerFeedFoward(this.layers[c - 1]);
    }
};

PerceptronMulticapas.prototype.train = function(inputs, learningRate, desiredError, limitEpocas){
    //Variable que va a almacenar el error global de la red después de la presentación de los patrones.
    var erroGlobal;

    //Variable que almacenará la cantidad de épocas necesaria para entrenar la red.
    var epocas = 0;
    
    if (limitEpocas === undefined){
        limitEpocas = 50000;
    }

    /* Realizando el entrenamiento */
    do{
        erroGlobal = 0.0;
        //Presentando los patrones de entrenamiento para la red y realizando el entrenamiento de la misma.
        for (var i = 0; i < inputs.length; i++){
            //Alimentando la red con el estándar.
            this.feedPerceptronFeedFoward(inputs[i].in);

            //Realizando la retropropagación del error a la última capa y ya sumando el error calculado a la predeterminada en el error global.
            erroGlobal += 0.5 * this.layers[this.layers.length - 1].calcularErroRetropropBackPropArray(inputs[i].out);

            //Realizando la retropropaga del error para las demás capas.
            for (var c = this.layers.length - 2; c >= 0; c--){
                this.layers[c].calcularErroRetropropBackProp(this.layers[c + 1]);
            }

            //Actualizando los pesos de las neuronas de la primera capa.
            this.layers[0].updateWeightsNeuronsArray(inputs[i].in, learningRate);

            //Actualizando los pesos de las neuronas de las demás capas.
            for (c = 1; c < this.layers.length; c++){
                this.layers[c].updateLayerWeightsNeurons(this.layers[c - 1], learningRate);
            }

            //Realizando o cálculo do MSE.
            //erroGlobal = erroGlobal / inputs.length;
        }
        //Atualizando a quantida de épocas.
        epocas++;
        if(epocas > limitEpocas){
            this.error = 1;
        }
    } while (erroGlobal > desiredError && this.error === 0);

    return epocas;
};

PerceptronMulticapas.prototype.addLayer = function(layer) {
    this.layers.push(layer);
};



// ***************** LAYERS ******************** //
function Layer(qtdNeuronsPreviousLayer, qtdNeuronsLayer, min,max){
    this.neurons = [];
    
    //Creando las neuronas para esta capa.
    for (var i = 0; i < qtdNeuronsLayer; i++){
	this.neurons.push(new Neuron(qtdNeuronsPreviousLayer,1, min, max));
    }
}

/** Método que realiza la alimentación de esta capa
  a través del método FeedFoward.
  El método recibe la capa anterior a la capa de la cualn
  el método se está invocando y realiza la alimentación
  de la red. */
Layer.prototype.feedLayerFeedFoward = function(backLayer) {

    for (var n = 0; n < this.neurons.length; n++){
        //Calculando el valor de la función de integración para la neurona "n-ésimo".
        var valor = 0.0;

        for (var i = 0; i < backLayer.neurons.length; i++){
            valor += this.neurons[n].w[i] * backLayer.neurons[i].activa;
        }

        //Calculando la activación de la neurona con el uso del bias con su derivada.
        this.neurons[n].activa = this.sigmoide(valor + this.neurons[n].bias);
        this.neurons[n].derivadaActiva = this.derivadaSigmoide(this.neurons[n].activa);
    }
};

/** Método que realiza la alimentación de esta capa
  a través del método FeedFoward.
  El método en lugar de recibir la capa anterior a ésta,
  recibe un vector que contiene algún patrón para ser presentado
  a la capa. Utilizar este método para presentar los patrones que
  desean ser clasificados. */
Layer.prototype.feedLayerFeedFowardArray = function(array) {
	
    for (var n = 0; n < this.neurons.length; n++){
        //Calculando el valor de la función de integración para la neurona "n-ésimo".
        var valor = 0.0;

        for (var i = 0; i < array.length; i++){
            valor += this.neurons[n].w[i] * array[i];
        }

        //Calculando la activación de la neurona con el uso del bias con su derivada.
        this.neurons[n].activa = this.sigmoide(valor + this.neurons[n].bias);
        this.neurons[n].derivadaActiva = this.derivadaSigmoide(this.neurons[n].activa);
    }
};

Layer.prototype.sigmoide = function(z) {
    //return Math.tanh(z);
    return 1.0 / ((1.0) + Math.exp(-z));
    //return (z >= 0) ? 1 : 0;
};

Layer.prototype.derivadaSigmoide = function(valSig) {
    //return 1.0 - Math.pow(valSig, 2);
    return valSig * (1.0 - valSig);
    //return 1.0;
};

/** Método que realiza el cálculo de los errores retropropagados
  de las neuronas de esta capa a través del método Backprop.
  El método recibe la capa posterior a la capa de la cual
  el método se invoca y realiza el cálculo
  del error retropropagado de las neuronas. */
Layer.prototype.calcularErroRetropropBackProp = function(lastLayer) {

    for (var n = 0; n < this.neurons.length; n++){
        /* Calculando la suma de los errores de la capa posterior multiplicados por los pesos de la neurona "n-ésimo".*/
        var error = 0.0;

        for (var i = 0; i < lastLayer.neurons.length; i++){
            /*Calculando el error de la neurona "i-ésimo" de la capa posterior
              multiplicado por el peso de la capa posterior que se
              se conecta a su neurona "n-ésimo" que está teniendo su error
              calculado, y sumando ...*/
            error += lastLayer.neurons[i].w[n] * lastLayer.neurons[i].erroRetroprop;
        }

        /* Por último, calculando el error retropropagado de la neurona. */
        this.neurons[n].erroRetroprop = this.neurons[n].derivadaActiva * error;
    }
};

/** Método que realiza el cálculo de los errores retropropagados
  de las neuronas de esta capa a través del método Backprop.
  En lugar de recibir la capa posterior, este método recibe
  el patrón de salida deseado para esta capa a través de
  una matriz, es decir, esta función sólo debe ejecutarse
  si esta capa es la última capa del Perceptron
  Multicamadas (capa de salida).
  La función devuelve el error del patrón mostrado a
  red. */
Layer.prototype.calcularErroRetropropBackPropArray = function(array) {

    /* Variable que almacenará el error en el patrón presentado
      a través de la red "array". */
    var error = 0.0;

    /* recorremos las neuronas de la capa */
    for (var n = 0; n < this.neurons.length; n++){
        //Calculando del error de la salida para la neurona "n-ésimo".
        var errorSalidaNeurona = this.neurons[n].activa - array[n];

        //Calculando el error retropropagado.
        this.neurons[n].erroRetroprop = errorSalidaNeurona * this.neurons[n].derivadaActiva;

        //Calculando el error para el valor predeterminado...
        error += Math.pow(errorSalidaNeurona, 2);
    }

    //Devuelve el error del patrón que se muestra en la red.
    return error;
};

/**Método que realiza la actualización de los pesos de las neuronas capa.
  El método recibe la capa anterior a esta capa y también recibe
  la tasa de aprendizaje para la actualización de los pesos. */
Layer.prototype.updateLayerWeightsNeurons = function(camadaAnterior, learningRate){
	/* Percorrendo os neurônios da camada. */
	for (var n = 0; n < this.neurons.length; n++)
	{
	    /* Percorrendo os pesos do neurônio "n-ésimo". */
	    for (var i = 0; i < camadaAnterior.neurons.length; i++)
	    {
		/* Atualizando o peso "i-ésimo" do neurônio "n-ésimo". */
		this.neurons[n].w[i] += -learningRate * camadaAnterior.neurons[i].activa * this.neurons[n].erroRetroprop;
	    }

	    /* Atualizando o bias do neurônio "n-ésimo". */
	    this.neurons[n].bias += -learningRate * this.neurons[n].erroRetroprop;
	}
    };

/** Método que realiza la actualización de los pesos de las neuronas capa.
  El método en lugar de recibir la capa anterior a ésta, recibe un
  array que contiene el patrón de entrada que se desea presentar
  a la red para ser clasificado, además de la tasa de aprendizaje. */
Layer.prototype.updateWeightsNeuronsArray = function(array, learningRate){
    //Recorriendo las neuronas de la capa.
    for (var n = 0; n < this.neurons.length; n++){
        //Recorriendo los pesos de la neurona "n-ésimo"
        for (var i = 0; i < array.length; i++){
            //Actualizando el peso "i-ésimo" de la neurona "n-ésimo"
            this.neurons[n].w[i] += -learningRate * array[i] * this.neurons[n].erroRetroprop;
        }

        //Actualizando el bias de la neurona "n-ésimo" ...
        this.neurons[n].bias += -learningRate * this.neurons[n].erroRetroprop;
    }
};

/************
 * Neurona *
 ************
/** Objeto que representará uno
  neurona de una capa de la red neural
  Feedforward.
 
  El constructor recibe la cantidad de pesos
  que la neurona debe tener y el bias. Después de eso,
  se generarán los pesos para la neurona automáticamente
  en el intervalo de "min" hasta "max" (si los parámetros
  no sean informados, los pesos se generarán en el intervalo
  de -0.5 a 0.5.
  En el caso de que el parámetro bias no sea informado,
  el valor predeterminado para el mismo será 1. */
function Neuron(qtdWeightsNeuron, bias, min, max){
    this.activa = 0;
    this.derivadaActiva = 0;
    this.erroRetroprop = 0;
    bias === undefined ? this.bias = 1 : this.bias = bias;

    //Comprobando si los parámetros para el intervalo de los pesos fueron informados.
    if (min === undefined || max === undefined){
	/* Caso não tenham sido informados, atribuindo 
	 o valor padrão para os mesmos. */
	min = -0.5;
	max = 0.5;
    }
    
    //Pesos de esta neurona
    this.w = [];

    //Generando los pesos aleatorios para la neurona.
    for (var i = 0; i < qtdWeightsNeuron; i++)
    {
        var v = Math.random() * (max - min) + min;
	this.w.push(v);
    }
}


