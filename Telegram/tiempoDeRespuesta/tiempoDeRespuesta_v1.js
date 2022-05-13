/* INFORMACION:
 *    Este script se debe ejecutar en la consola de tu navegador.
 *    El chat a ser analizado, debe estar abierto y situarce en los últimos mensajes (al final del chat).
*/




/* AJUSTES */
    //CANTIDAD DE MENSAJES A SER ANALIZADOS
    var n = 1000;

    //EN FORMATO 24hs ESPECIFIQUE DESDE QUE HORA HASTA QUE HORA HAY QUE TENER EN CUENTA LOS MENSAJES.
    //LOS MENSAJES FUERA DEL RANGO ESTABLECIDO, SE IGNORARÁN.
    var desdeHasta = [ 14, 19 ];




/* OBTENCION DE DATOS (RECOLECCIÓN) */
    //CAJA QUE CONTIENE MENSAJES
    var mensajes = document.getElementsByClassName("MessageList custom-scroll no-avatars scrolled")[0];
    
    var tiempos = Array();
    var antiguos = Array();
    var antifuga = 0;
    
    var loop = setInterval(()=>{
        var mensaje = document.getElementsByClassName("Message message-list-item");
        for (let i=0; i<mensaje.length; i++) {
            let p = antiguos.indexOf(mensaje[i])
            if (p == -1) {
                antiguos.push(mensaje[i]);
                
                let ram = mensaje[i].innerText.split("\n");
                if (ram[ram.length-1].split("edited ").length >= 2) {
                    tiempos.push(ram[ram.length-1].split("edited ")[1]);
                } else {
                    tiempos.push(ram[ram.length-1]);
                }
    
                tiempos[tiempos.length-1] += (mensaje[i].getAttribute("class").split(" ").indexOf("own")+1)?":A":":B";
    
                let str = tiempos[tiempos.length-1].split("");
                let a = str.indexOf("(");
                let b = str.indexOf(")");
                
                if (a != -1  &&  b != -1) {
                    tiempos[tiempos.length-1] = 
                        str.slice(0, a-1).join("") + 
                        str.slice(b+1).join("");
                }
                
                if (tiempos.length >= n){
                    clearInterval(loop);
                    fLuego();
                    i=mensaje.length;
                }
            }
        }
                    
        mensajes.scrollTop = 0;
    }, 1000);




function fLuego() {
    /* ESTADISTICA: PROCESO Y FILTRACION */
        //DECLARACIONES
            var tardanzaA = Array();
            var tardanzaB = Array();

            var etapa = false;

            function fTiempo(x){
                x = x.split(":");
                return parseInt(x[0])*60 + parseInt(x[1]);
            }

        //PREPARACION
            desdeHasta[0] *= 60;
            desdeHasta[1] *= 60;
  
            var ultimoTiempo = fTiempo(tiempos[0]);
            var ultimoSujeto = tiempos[0].split(":")[2];

        //PROCESO
            for (let i=1; i<tiempos.length; i++) {
                let t = fTiempo(tiempos[i]);

                if (t >= desdeHasta[0] && t<= desdeHasta[1]) {
                    if (etapa) {
                        if (ultimoSujeto == tiempos[i].split(":")[2]) {
                            ultimoTiempo = fTiempo(tiempos[i]);
                        } else {
                            if (tiempos[i].split(":")[2] == "A") {
                                tardanzaA.push(fTiempo(tiempos[i]) - ultimoTiempo);
                            } else {
                                tardanzaB.push(fTiempo(tiempos[i]) - ultimoTiempo);
                            }

                            ultimoSujeto = tiempos[i].split(":")[2];
                        }
                    } else {
                        ultimoTiempo = fTiempo(tiempos[i]);
                        ultimoSujeto = tiempos[i].split(":")[2];

                        etapa = true;
                    }
                } else etapa = false;
            }




    /* ESTADISTICA: CALCULO Y OUTPUT */
        var promedioA = 0;
        var promedioB = 0;
        var n = 0;
        var min = (tardanzaA.length < tardanzaB.length) ? tardanzaA.length : tardanzaB.length;

        for (let i=0; i<min; i++) {
            promedioA += tardanzaA[i];
            promedioB += tardanzaB[i];
        }

        promedioA /= min;
        promedioB /= min;

        var total = promedioA + promedioB;

        console.log("Sujeto A demora "+parseFloat(promedioA, 2)+" segundos en responder.\nSujeto B demora "+parseFloat(promedioB, 2)+ " segundos en responder.");
        console.log("Sujeto A: "+parseFloat(promedioA*100/total, 2)+"%\nSujeto B: "+parseFloat(promedioB*100/total+"%", 2));
}
