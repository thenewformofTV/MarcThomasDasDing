//Fremdcode für Back to Top Button, teils modifiziert
// Sobald der User 20 px runtergescrollt ist, erscheint der Button
window.onscroll = function() {
	scrollFunction();
};

function scrollFunction() {
	if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
		document.getElementById("topButton").style.display = "block";
	} else {
		document.getElementById("topButton").style.display = "none";
	}
}

// Wenn der User auf den Button klickt, scrollt es nach ganz oben
function topFunction() {
	document.body.scrollTop = 0; // Für Chrome, Safari und Opera
	document.documentElement.scrollTop = 0; // Für IE und Firefox
}
//Fremdcode Ende

//Datenbank inizialisieren

var db;

function openDB() {
	db = openDatabase('vwFanBaseDB', '1.0', 'VWFanBase', 1 * 1024 * 1024);
}

function tabelleErzeugen(tx) {
	console.log(tx);
	tx.executeSql('CREATE TABLE IF NOT EXISTS Guestbook(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, username VARCHAR(255) NOT NULL, nachricht VARCHAR(255) NOT NULL, date VARCHAR(255) NOT NULL)', [], SQLSuccess, SQLFail);
} // Datum wurde als Text eingefügt

function SQLSuccess() {
	console.log("Erfolg!");
}

function SQLFail() {
	console.log("Misserfolg!");
}

//Senden Funktion schreibt Username und Nachricht in Datenbank und führt die Funktion getAllMessages aus.
function senden(tx) {
	var username = document.getElementById("username").value;
	var nachricht = document.getElementById("nachricht").value;
	var today = new Date();  //auslesen des jetzigen Datums
	var dd = today.getDate();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();
	var hh = today.getHours();
	var nn = today.getMinutes();

	today = dd + '/' + mm + '/' + yyyy + '/ ' + hh + ':' + nn;


	var sqlString = 'INSERT INTO Guestbook(username, nachricht, date) VALUES (?,?,?);';
	tx.executeSql(sqlString, [username, nachricht, today], getAllMessages, SQLFail);
}

//Holt alles Nachrichten aus der Datenbank
function getAllMessages(tx) {
	tx.executeSql('SELECT * FROM Guestbook', [], displayResults, SQLFail);
}

//Fügt die Nachrichten in einer Tabelle im DOM ein
function displayResults(tx, results) {
	var ausgabe = document.getElementById('ausgabe');
	var htmlText = "<table id='tblGuestbook'>";
	htmlText += "<tr><th>Benutzername</th><th>Nachricht</th><th>Datum</th><th>Aktionen</th></tr>";
	for (i = 0; i < results.rows.length; i++) {
		var zeile = results.rows.item(i);
		var deleteButton = "<input type='button' id='delete' value='Löschen' onclick='deleteNachricht(" + zeile.id + ");' />";
		var editButton = "<input type='button' id='edit' value='Bearbeiten' onclick='edit(" + zeile.id + ",\"" + zeile.username + "\",\"" + zeile.nachricht + "\");' />";

		htmlText += "<tr>   <td>" + zeile.username + "</td><td>" + zeile.nachricht + "</td><td>" + zeile.date + "</td><td>" + editButton + " " + deleteButton + "</td><tr>";
	}
	htmlText += "</table>";
	ausgabe.innerHTML = htmlText;
}

//Wird bei Klick auf den Edit Button ausgeführt. Schreibt Daten zur Bearbeitung in Eingabefelder.
//Speichern und Senden Buttens werden ausgetauscht.
function edit(id, username, nachricht) {
	document.getElementById("btnSpeichern").style.display = "inline";
	document.getElementById("senden").style.display = "none";
	document.getElementById('editId').value = id;
	document.getElementById('username').value = username;
	document.getElementById('nachricht').value = nachricht;
}

//Speichert die geänderten Werte in die Datenbank.
function editMessage() {  
	var username = document.getElementById("username").value;
	var nachricht = document.getElementById("nachricht").value;
	var id = document.getElementById("editId").value;
	db.transaction(
		function(tx) {
			tx.executeSql('UPDATE Guestbook set username=?, nachricht=? where id=?', [username, nachricht, id], getAllMessages, SQLFail);
		}
	);
	//Senden und Speichern Butten werden ausgetauscht.
	document.getElementById("btnSpeichern").style.display = "none";
	document.getElementById("senden").style.display = "inline";
}

//Nachricht wird aus DB gelöscht.
function deleteNachricht(id) {
	db.transaction(
		function(tx) {
			tx.executeSql('DELETE FROM Guestbook WHERE id=?', [id], getAllMessages, SQLFail);
		}
	);
}

//Hilfsfunktion zum Löschen der Datenbank.
function dropTable(tx) {
	tx.executeSql('DROP TABLE Guestbook', [], SQLSuccess, SQLFail);
}

//Hilfsfunktion zum Einfügen von Standartwerden in das Gästebuch.
function addStandardEintraege(tx) {
	var username = "Michael Matt";
	var nachricht = "Wow, echt schöne Bilder und die wichtigsten Informationen, die ich gesucht habe. Weiter so!";
	var date = 31 + '/' + 05 + '/' + 2017 + '/ ' + 12 + ':' + 32;

	var sqlString = 'INSERT INTO Guestbook(username, nachricht, date) VALUES (?,?,?);';
	tx.executeSql(sqlString, [username, nachricht, date], getAllMessages, SQLFail);


	username = "Thomas Nessensohn";
	nachricht = "Endlich eine Website, auf der ich mich mit Gleichgesinnten austauschen kann";
	date = 16 + '/' + 06 + '/' + 2017 + '/ ' + 19 + ':' + 21;
	sqlString = 'INSERT INTO Guestbook(username, nachricht, date) VALUES (?,?,?);';
	tx.executeSql(sqlString, [username, nachricht, date], getAllMessages, SQLFail);

	username = "Tanja Hämmerle";
	nachricht = "Das muss ich euch lassen, das Layout eurer Website ist euch echt gelungen!";
	date = 21 + '/' + 06 + '/' + 2017 + '/ ' + 23 + ':' + 12;
	sqlString = 'INSERT INTO Guestbook(username, nachricht, date) VALUES (?,?,?);';
	tx.executeSql(sqlString, [username, nachricht, date], getAllMessages, SQLFail);


}

//Überprüft ob Standartwerte schon in Datenbank eingefügt wurden mittels speicher in LocalStorage.
function init() {
	if (typeof(localStorage.isEmpty) == "undefined") {
		localStorage.setItem("isEmpty", true);
		if (localStorage.getItem("isEmpty") !== false) {
			db.transaction(addStandardEintraege);
			localStorage.setItem("isEmpty", false);
		} else {
			console.log("LocalStorage existiert.");

		}
	}


}

openDB();
db.transaction(tabelleErzeugen);