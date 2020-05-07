/*DEFINE VARIAVEIS*/
var getFilialByEmail = {
    "exemple@mail.com": 0
};
var getLoginEmail = {
    1: new Array("exemple@mail.com","password")
};


/*DEFINE LINKS*/
var linkDownloadTransacoes = "https://pagseguro.uol.com.br/transaction/hist.jhtml";
var linkFinanceiro = "https://pagseguro.uol.com.br/statement/statement.jhtml";
var linkLogout = "https://pagseguro.uol.com.br/logout.jhtml";

main();

function main(){
    var url = document.URL;
    if (url.search("/login") > -1) paginaLogin();
    else if (url.search("/resumo") > -1) paginaResumo();
    else if (url.search("/hub") > -1) paginaHub();
    else if (url.search("/transaction/find") > -1) paginaTransacoes();
    else if (url.search("/transaction/hist") > -1) paginaDownlaodTransacoes();
    else if (url.search("statement/statement") > -1) paginaFinanceiro(); /*financeiro form*/
    else if (url.search("statement/period") > -1) paginaFinanceiro(); /*financeiro click download*/
    else if (url.search("statement/history") > -1) paginaDownloadFinanceiro(); /*financeiro downloads*/
    else if (url.search("://pagseguro.uol.com.br/") > -1) window.location = "/login.jhtml";
    else console.log('Página desconhecida para script Moresco - Pag Seguro.');
}

/*CONTROLES DE PÁGINA*/
function paginaLogin(){
    var login_atual = getLoginAtual();

    if(login_atual <= 14){
        document.getElementById("email").value = getLoginEmail[login_atual][0];
        document.getElementById("password").value = getLoginEmail[login_atual][1];
        document.getElementById("entrar").click();
    }else{
        console.log('Programa terminado!');
    }
}
function paginaHub(){
    var mes = getMes();
    console.log('Mes : ' + mes);
    if(mes !== 0){
        var t = getDataInicio(mes),
            a = getDataFim(t);
    
        window.location = getLinkTransacoes(t,a);
    }else{
        alert("Mês inválido! Recarregue a página para tentar novamente!");
    }
}
function paginaTransacoes() {
    window.onload = function(){
        waitElement("#entrarCaptcha",function(e){
            $("#entrarCaptcha").focus();
            e.click();
            
            waitRecpatchaResponse(function(){
                waitElement("#exportFile > fieldset > input",function(e){
                    e.click();
                    /*Programa para recarregar a página, que só irá acontecer se não ir sozinho para os downlaods*/
                    
                    waitElement(".uolMsg-success",function(e){
                        setTimeout(function(){
                            window.location = linkDownloadTransacoes;
                        },10000);
                    },120,function(){
                        location.reload();
                    });
                },120,function(){
                    location.reload();
                    //console.log("Recarregou 60");
                }); 
            });
        },600,function(){
            location.reload();
        });  
    };
}
function paginaDownlaodTransacoes() {
    /*Se já tiver baixado as transações, vai para financeiro, se não, baixa*/
    var e = "form#delfiles tr:nth-child(1) > td:nth-child(4)";
    waitForElementToDisplay(e, 1000, function() {
        /*VERIFICA SE EXISTE ARQUIVO DE HOJE*/
        var t = getDateFrom_DateFile($(e).text()),
            a = new Date,
            i = new Date;
        i.setFullYear(a.getFullYear(), a.getMonth() + 1, a.getDate());
        if (t.toString() === i.toString()) {
            /*DEFINE O CTRL C COMO O NOME DO ARQUIVO*/
            var o = $(".user__email").text();
            colocaNoCtrlC("Transacoes Filial " + getFilialByEmail[o]);
            /*CLICA PARA FAZER DOWNLOAD*/
            $("#delfiles > table > tbody > tr:nth-child(1)").click();
            waitPageLoadingForSeconds(5,function(){
                /*DEFINE COOKIE COMO ARQUIVO SALVO*/
                window.location = linkFinanceiro;
            });
        } else {
            setTimeout(function() {
                location.reload();
            }, 5000);
        };
    });
}
function paginaFinanceiro() {
    var e = getMes();
    if (0 !== e) {
        var t = getDataInicio(e),
            a = getDataFim(t);
        t = putZerosOnDate(t);
        a = putZerosOnDate(a);
        if (t !== $("#initialDate").val() | a !== $("#finalDate").val()) {
            $("#initialDate").val(t);
            $("#finalDate").val(a);
            $("#criteria").submit();
        } else {
            $("#exportLinks a")[0].click();
            waitElement(".uolMsg-success",function() {
                window.location = "history.jhtml";
            },90,function(){
                window.reload;
            });
        }
    } else alert("Não é um mês válido!");
}
function paginaDownloadFinanceiro() {
    var i = "form#delfiles tr:nth-child(1) > td:nth-child(4)";
    waitElement(i,function() {
        var e = getDateFrom_DateFile($(i).text()),
            t = new Date,
            a = new Date;
        a.setFullYear(t.getFullYear(), t.getMonth() + 1, t.getDate());
        if (e.toString() === a.toString()) {
            var o = $(".user__email").text();
            colocaNoCtrlC("Financeiro Filial " + getFilialByEmail[o]);
            $("#delfiles > table > tbody > tr:nth-child(1)").click();
            waitPageLoadingForSeconds(5,function(){
                setLoginAtual(getLoginAtual() + 1);
                window.location = linkLogout;
            });
        } else {
            setTimeout(function() {
                location.reload();
            }, 5000);
        }
    },600,function(){
        location.reload();
    });
}

/*GET LINK PAGES*/
function getLinkTransacoes(dataInicio,dataFim){
    return "https://pagseguro.uol.com.br/transaction/find.jhtml?page=1&pageCmd=&exibirFiltro=false&exibirHora=false&interval=3&dateFrom=" + dataInicio + "&dateTo=" + dataFim + "&dateToInic=" + dataFim + "&timeFrom=00:00&timeTo=23:59&status=3&status=1&paymentMethod=&type=&operationType=T&selectedFilter=all&filterText=&fileType=csv";
}

function putZerosOnDate(e) {
    var t = e.toString().split("/");
    if (1 == t[1].length) var a = "0";
    else a = "";
    if (a += t[1], 1 == t[0].length) var i = "0";
    else i = "";
    return t = +(i += t[0]) + "/" + a + "/" + t[2]
}

function getDateFrom_DateFile(e) {
    var t = e.toString().split(" ");
    t = t[0].toString().split("/");
    var a = new Date;
    return a.setFullYear(t[2], t[1], t[0]), a;
}


function verificaMes(mes) {
    try {
        var t = parseInt(mes);
        return !0 === Number.isInteger(t) && t >= 1 & t <= 12 ? t : 0;
    } catch (mes) {
        return 0;
    }
}
function getDataInicio(e) {
    e -= 1;
    var t = new Date,
        a = t.getFullYear(),
        i = a - 1,
        o = new Date;
    o.setFullYear(a, e, 1);
    var r = new Date;
    r.setFullYear(i, e, 1);
    var n = t.getTime() - o.getTime(),
        l = t.getTime() - r.getTime();
    return (n = Math.abs(n)) < (l = Math.abs(l)) ? (o.setDate(o.getDate() - 4), o.getDate() + "/" + (o.getMonth() + 1) + "/" + o.getFullYear()) : (r.setDate(r.getDate() - 4), r.getDate() + "/" + (r.getMonth() + 1) + "/" + r.getFullYear())
}
function getDataFim(e) {
    var t = e.toString().split("/"),
        a = parseInt(t[0]),
        i = parseInt(t[1]) - 1,
        o = parseInt(t[2]),
        r = new Date(o, i, a);
    return r.setDate(r.getDate() + 4), r.setMonth(r.getMonth() + 1), r.setDate(r.getDate() - 1), r.getDate() + "/" + (r.getMonth() + 1) + "/" + r.getFullYear()
}

/*GETTERS*/
function getLoginAtual(){
    try{
        var l = sessionStorage.getItem('loginAtualMoresco');
        if(l !== null & l !== undefined & l !== '' & l > 0){
            return Number(l);
        }else{
            setLoginAtual(1);
            return 1;
        }
    }catch(e){
        setLoginAtual(1);
        return 1;
    }
}
function getMes() {
    try{
        //var mes = sessionStorage.getItem('mesMoresco');
        var mes = getCookie('mesMoresco');
        if(mes === null | mes === undefined | mes === '' | mes === 0){
            mes = prompt("Digite o mês:");
            mes = verificaMes(mes);
            if(mes !== 0){
                setMes(mes);
            }
        }else{
           mes = verificaMes(mes);
        }
        return mes;
    }catch(e){
        return 0;
    }
}

/*SETTERS*/
function setLoginAtual(loginAtual){
    sessionStorage.setItem('loginAtualMoresco',loginAtual);
}
function setMes(mes){
    setCookie('mesMoresco',mes,1);
    //sessionStorage.setItem('mesMoresco',mes);
}

