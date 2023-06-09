var _locale_data = {
	"langs_for_domains": {
		"com.au": "en",
		"co.at": "de",
		"ca": "en",
		"dk": "da",
		"fi": "en",
		"fr": "fr",
		"com.de": "de",
		"ie": "en",
		"it": "it",
		"jp": "ja",
		"my": "en",
		"co.nl": "nl",
		"co.nz": "en",
		"no": "en",
		"pl": "pl",
		"sg": "en",
		"co.za": "en",
		"se": "sv",
		"org.uk": "en",
		"us": "en"
	},
	"messages": {
		"da": {
			"best_gender_position": "bedste placering køn",
			"best_position": "bedste placering overall",
			"best_time": "bedste tid",
			"bingo": "this parkrunner has completed {PROGRESS} of parkrun bingo - only {LEFT} to go!",
			"bingo_completed": "BINGO!!! Congrats to this parkrunner for completing parkrun bingo \\(^O^)/",
			"bingo_info": "på {COURSE} {DATE}",
			"bingo_more": "{NUMBER} mere",
			//"map_mask_completed": "afsluttet",
			//"map_mask_all": "all",
			"map_mask_junior": "junior",
			"map_mask_parkrun": "parkrun",
			"times_completed": "antal event",
			"view_on_map": "Se denne løbers parkruns på en kort"
		},
		"de": {
			"best_gender_position": "beste Position nach Geschlecht",
			"best_position": "beste Position insgesamt",
			"best_time": "beste Zeit",
			"bingo": "diese/r Parkrunner*in hat {PROGRESS} von Parkrunbingo vollendet - nur {LEFT} verbleibend!",
			"bingo_completed": "BINGO!!! Herzlichen Glückwunsch an diese/n Parkrunner*in für Parkrunbingo zu vollenden \\(^O^)/",
			"bingo_info": "bei {COURSE} am {DATE}",
			"bingo_more": "{NUMBER} mehr",
			"map_mask_completed": "nur Vollendete zeigen",
			"map_mask_all": "alle",
			"map_mask_junior": "Junior",
			"map_mask_parkrun": "Parkrun",
			"times_completed": "Ereignisanzahl",
			"view_on_map": "Parkruns dieses/r Parkrunner(in)s auf einer Karte ansehen"
		},
		"fr": {
			"best_gender_position": "meilleure position genre",
			"best_position": "meilleure position générale",
			"best_time": "meilleure temps",
			"bingo": "this parkrunner has completed {PROGRESS} of parkrun bingo - only {LEFT} to go!",
			"bingo_completed": "BINGO!!! Congrats to this parkrunner for completing parkrun bingo \\(^O^)/",
			"bingo_info": "at {COURSE} on {DATE}",
			"bingo_more": "{NUMBER} autres",
			//"map_mask_all": "all",
			//"map_mask_completed": "complété",
			"map_mask_junior": "junior",
			"map_mask_parkrun": "parkrun",
			"times_completed": "nombre d'événements",
			"view_on_map": "Consulter les parkruns de ce parkrunneur sur une carte"
		},
		"en": {
			"best_gender_position": "best gender position",
			"best_position": "best position overall",
			"best_time": "best time",
			"bingo": "this parkrunner has completed {PROGRESS} of parkrun bingo - only {LEFT} to go!",
			"bingo_completed": "BINGO!!! Congrats to this parkrunner for completing parkrun bingo \\(^O^)/",
			"bingo_info": "at {COURSE} on {DATE}",
			"bingo_more": "{NUMBER} more",
			"map_mask_all": "all",
			"map_mask_completed": "only show completed",
			"map_mask_junior": "junior",
			"map_mask_parkrun": "parkrun",
			"technical_details": "Log & Technical",
			"times_completed": "times completed",
			"view_on_map": "View this parkrunner's parkruns on a map"
		},
		"it": {
			"best_gender_position": "miglior posizione di genere",
			"best_position": "miglior posizione assoluta",
			"best_time": "miglior tempo",
			"bingo": "this parkrunner has completed {PROGRESS} of parkrun bingo - only {LEFT} to go!",
			"bingo_completed": "BINGO!!! Congrats to this parkrunner for completing parkrun bingo \\(^O^)/",
			"bingo_info": "at {COURSE} on {DATE}",
			"bingo_more": "altri {NUMBER}",
			//"map_mask_all": "all",
			//"map_mask_completed": "completato",
			"map_mask_junior": "junior",
			"map_mask_parkrun": "parkrun",
			"times_completed": "numero di eventi",
			"view_on_map": "Visualizza i parkrun di questo parkrunner su una mappa"
		},
		"nl": {
			"best_gender_position": "beste positie geslacht",
			"best_position": "beste positie algeheel",
			"best_time": "beste tijd",
			"bingo": "deze parkrunner heeft {PROGRESS} van parkrun bingo voltooid - nog {LEFT} te gaan!",
			"bingo_completed": "BINGO!!! Gefeliciteesd aan deze parkrunner met het voltooieen von parkrun bingo \\(^O^)/",
			"bingo_info": "in {COURSE} op {DATE}",
			"bingo_more": "meer ({NUMBER})",
			"map_mask_all": "alle",
			//"map_mask_completed": "voltooid",
			"map_mask_junior": "junior",
			"map_mask_parkrun": "parkrun",
			"times_completed": "aantal keer voltooid",
			"view_on_map": "Bekijk de parkruns von deze parkrunner op de kaart"
		},
		"sv": {
			"best_gender_position": "bästa resultat för ditt kön",
			"best_position": "bästa placering totalt",
			"best_time": "bästa tid",
			"bingo": "denna deltagare har avslutat {PROGRESS} av parkrunbingot - bara {LEFT} kvarstår!",
			"bingo_completed": "BINGO!!! grattis til denna deltagare för att avsluta parkrunbingot \\(^O^)/",
			"bingo_info": "på {COURSE} på {DATE}",
			"bingo_more": "{NUMBER} mer",
			"map_mask_all": "alla",
			"map_mask_completed": "visa bara avslutad",
			"map_mask_junior": "junior",
			"map_mask_parkrun": "parkrun",
			"times_completed": "antal event",
			"view_on_map": "Se denna deltagares parkruns på en karta"
		}
	}
}

var _lang;

function set_language(lang) {
	_lang = lang;
}

function get_language_for_domain(domain) {
	var lang = _locale_data.langs_for_domains[domain];
	if (lang == null) {
		console.warn("sorry! I haven't added a translation for '"+lang+"' yet so you're stuck with English for now :( ... please nag me on the github page: https://github.com/mmmsoup/parkstats");
		lang = "en";
	}
	return lang;
}

get_localised_string = function(message) {
	if (_lang == null || _locale_data.messages[_lang][message] == null) {
		return _locale_data.messages["en"][message];
	} else {
		return _locale_data.messages[_lang][message];
	}
}

