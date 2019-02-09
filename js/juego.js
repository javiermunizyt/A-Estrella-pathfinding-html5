// TUTORIALES
// https://www.youtube.com/watch?v=aKYlikFAV4k&t=2535s
// https://www.youtube.com/watch?v=EaZxUCWAjb0&t=5s


var canvas;
var ctx;
var FPS = 50;


//DEFINIMOS LA CANTIDAD DE FILAS Y COLUMNAS DE LA MATRIZ NIVEL
var cols = 50;
var rows = 50;

//DIMENSIONES DE LOS TILES
var anchoF;
var altoF;

//COLORES DE LOS MATERIALES DEL ESCENARIO
var muro = '#888888';
var tierra = '#AAAAAA';

//CREAMOS LAS FILAS DEL ESCENARIO
var escenario = new Array(cols);

//CREAMOS LOS ARRAYS PARA EL A* (aquí se guardan los nodos por comprobar y los disponibles)
var openSet = [];
var closedSet = [];

//OBJETOS PARA ORIGEN Y DESTINO
var start;
var end;

//TERMINADO
var terminado = false;

//RUTA FINAL
var camino = [];


function inicializa(){
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  
  //CALCULAMOS EL ANCHO Y ALTO DE LOS TILES
  anchoF = parseInt(canvas.width/cols);
  altoF = parseInt(canvas.height/rows);
  
  //TERMINAMOS DE CREAR LA MATRIZ (CREANDO UN NUEVO ARRAY PARA LAS FILAS EN CADA COLUMNA)
  for(i=0; i<cols; i++){
	  escenario[i] = new Array(rows);
  }
  
  //CREAMOS LOS OBJETOS PARA LAS CASILLAS
  for(i=0; i<cols; i++){
	  for(j=0; j<rows; j++){
		  escenario[i][j] = new Casilla(i,j);
	  }
  }
  

  //AÑADIMOS LOS VECINOS DE CADA CASILLA DEL TABLERO
  for(i=0;i<cols;i++){
	  for(j=0;j<rows;j++){
		  escenario[i][j].addVecinos();
	  }
  }

  
  
  //CREAMOS LOS OBJETOS ORIGEN Y DESTINO PARA LA RUTA
  start = escenario[0][0];
  end = escenario[cols-1][rows-1];
  
  //AÑADIMOS EL PRIMER ELEMENTO (EN DONDE ESTAMOS AL OPENSET)
  openSet.push(start);
  
  
  //ARRANCAMOS EL BUCLE PRINCIPAL
  setInterval(function(){
    principal();
  },1000/FPS);
}




//FUNCIÓN HEURÍSTICA (distancia entre las casillas "a" y "b")
function heuristica(a,b){
	var x = Math.abs(a.x - b.x);
	var y = Math.abs(a.y - b.y);

	var dist = x+y;
	
	return(dist);
}





//OBJETO CASILLA
function Casilla(y,x){
	
	//TIPO DE TILE/COLOR
	this.tipo = 0;
	
	this.aleatorio = Math.floor(Math.random()*5);	//0-4
	
	if(this.aleatorio == 1)
		this.tipo = 1;
	
	
	//POSICIÓN
	this.x = x;
	this.y = y;
	
	
	//PARA EL PATHFINDING
	this.f = 0;	//Coste total (g+h)
	this.g = 0;	//Coste del movimiento a esta casilla
	this.h = 0;	//Eurística (coste estimado de llegar al destino)
	
	this.vecinos = [];	//lista de objetos casilla que son vecinos de esta
	
	this.padre = null;	//registro del nodo anterior cuando volvamos desde el final al inicio
	
	
	
	//MÉTODO QUE AÑADE LOS VECINOS
	this.addVecinos = function(){
	
		if(this.x>0){
			this.vecinos.push(escenario[this.y][this.x-1]);
		}
		
		if(this.x<rows-1){
			this.vecinos.push(escenario[this.y][this.x+1]);
		}
		
		if(this.y>0){
			this.vecinos.push(escenario[this.y-1][this.x]);
		}
		
		if(this.y<cols-1){
			this.vecinos.push(escenario[this.y+1][this.x]);
		}
	}
	
	
	
	//MÉTODO QUE DIBUJA LA CASILLA
	this.dibuja = function(){
		var color;
		
		//COMPROBAMOS EL TIPO DE TILE QUE ES
		if(this.tipo == 0){
			color = tierra;
		}
		
		if(this.tipo == 1){
			color = muro;
		}
		
		//DIBUJAMOS EL CUADRADO
		ctx.fillStyle = color;
		ctx.fillRect(this.x*anchoF,this.y*altoF,anchoF,altoF);
	}
	
	
	
	
	//---------------------------------------------------------------
	//MÉTODO QUE DIBUJA EL OPENSET (SÓLO PARA DEPURAR)
	this.dibujaOS = function(){
		ctx.fillStyle = '#008000';	//verde
		ctx.fillRect(this.x*anchoF,this.y*altoF,anchoF,altoF);
		
		//this.escribeTexto('#000000');
	}
	
	//MÉTODO QUE DIBUJA EL CLOSEDSET (SÓLO PARA DEPURAR)
	this.dibujaCS = function(){
		ctx.fillStyle = '#800000';	//rojo oscuro
		ctx.fillRect(this.x*anchoF,this.y*altoF,anchoF,altoF);
		
		//this.escribeTexto('#FFFFFF');
		
	}
	
	//MÉTODO QUE DIBUJA EL CAMINO FINAL (SÓLO PARA DEPURAR)
	this.dibujaCamino = function(){
		ctx.fillStyle = '#00FFFF';	//cyan
		ctx.fillRect(this.x*anchoF,this.y*altoF,anchoF,altoF);
		
		//this.escribeTexto('#000000');
	}
	
	
	
	//MÉTODO PARA ESCRIBIR EL TEXTO (SÓLO PARA DEPURAR)
	this.escribeTexto = function(color){
		ctx.fillStyle = color;
		ctx.font = "12px Arial";
		
		/*
		ctx.fillText("F" + this.f , this.x*anchoF + anchoF/2.5, this.y*altoF + altoF/3);
		ctx.fillText("g" + this.g , this.x*anchoF + anchoF/2.5, this.y*altoF + altoF/2);
		ctx.fillText("h" + this.h , this.x*anchoF + anchoF/2.5, this.y*altoF + altoF/1.5);
		*/
		
	}
	
	//---------------------------------------------------------------
	
}







function dibujaEscenario(){

  //DIBUJAMOS LAS CASILLAS DEL ESCENARIO
  for(y=0;y<cols;y++){
    for(x=0;x<rows;x++){
		escenario[y][x].dibuja();
    }
  }
  
  //DIBUJAMOS EL CLOSEDSET
  for(i=0;i<closedSet.length;i++){
	closedSet[i].dibujaCS();
  }
  
  //DIBUJAMOS EL OPENSET
   for(i=0;i<openSet.length;i++){
	openSet[i].dibujaOS();
  }
  
  //DIBUJAMOS EL CAMINO
   for(i=0;i<camino.length;i++){
	camino[i].dibujaCamino();
  }
  
}









function borraCanvas(){
  canvas.width=canvas.width;
  canvas.height=canvas.height;
}

//-------------------------------------------------------------------------------
//BUSCAR POR QUÉ SE HACE AL REVÉS (DUDA)
//BORRA UN ELEMENTO DEL ARRAY (NO UN ÍNDICE, SINO UN OBJETO IGUAL)
function borraDelArray(arr,el){
	for(i=arr.length-1; i>=0; i--){
		if(arr[i] == el){
			arr.splice(i,1);
		}
	}
}
//-------------------------------------------------------------------------------




function principal(){
	
  //HACEMOS EL BUCLE SIEMPRE Y CUANDO NO HAYAMOS TERMINADO
  if(!terminado){
	  //------------------------------------------
	  //Si quedan nodos por explorar
	  if(openSet.length>0){
		var ganador = 0;	//casilla con el menor esfuerzo (solución óptima)
		
		//Miramos a ver cual es la casilla de openSet que tiene un menor coste/esfuerzo
		for(i=0; i<openSet.length; i++){
			if(openSet[i].f < openSet[ganador].f){
				ganador = i;
			}
		}
		
		//La casilla que analizamos actualmente es la ganadora
		var actual = openSet[ganador];
		

		//Si la casilla con menor esfuerzo es la de destino "end", ya hemos llegado
		if(actual === end){
			
			
			
			//-------------------------------
			//ENCONTRAMOS EL CAMINO
			var temporal = actual;
			camino.push(temporal);
			
			while(temporal.padre){
				
				temporal = temporal.padre;
				camino.push(temporal);
			}
			//--------------------------------
			
		
		terminado = true;
		console.log("Fin");
		}
		
		//quitamos la casilla ganadora de openSet y la añadimos a closedSet
		borraDelArray(openSet,actual);
		closedSet.push(actual);
		
		/*
		//AÑADIMOS LOS VECINOS DE LA CASILLA (SI NO LOS HEMOS AÑADIDO ANTES)
		if(actual.vecinos.length==0){
			actual.addVecinos();
		}
		*/
		
		
		//Miramos los vecinos
		var vecinos = actual.vecinos;	//obtenemos un array con los objetos vecinos
		
		for(i=0; i<vecinos.length; i++){
			var vecino = vecinos[i];	//obtenemos el objeto casilla que se corresponde con cada vecino (pero es un objeto "casilla")
			
			//Si el objeto vecino no está en el array closedSet y tampoco es un muro (tipo 1) lo podemos evaluar
			if(!closedSet.includes(vecino) && vecino.tipo!=1){
				var tempG = actual.g + 1;	//incrementamos el peso del movimiento en 1 (porque es un vecino y hay que dar 1 paso)
			
				//si el vecino está en openSet y el nuevo esfuerzo es menor, lo actualizamos
				if(openSet.includes(vecino)){
					if(tempG < vecino.g){
						vecino.g = tempG;
					}
				}
				else{
					vecino.g = tempG;
					openSet.push(vecino);
				}
				
				//Actualizamos valores
				vecino.h = heuristica(vecino,end);	//heurística
				vecino.f = vecino.g + vecino.h;		//peso total
				
				vecino.padre = actual;				//indicamos de donde viene (quién es su padre)
			
			}//if
			
		}//for

	  }
	  
	  //Si ya no quedan nodos por explorar
	  
	  else{
		  console.log("no hay solución");
		  terminado = true;
	  }
	  //------------------------------------------
	
  }
	
  borraCanvas();
  dibujaEscenario();
}
