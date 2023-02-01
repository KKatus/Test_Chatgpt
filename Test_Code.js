/*------------------------------------------------------------------------------*/
/*                                                                              */
/*  OTR Neues Mandantendos anlegen                                              */
/*  ==============================                                              */
/*                                                                              */
/*  Dieses Skript legt ein neues Mandantendossier an. Die MandantenID kann      */
/*  manuell bestimmt. Wird das Feld für die MandantenID leer gelassen, dann     */
/*  wird eine beliebig fortlaufende MandantenID bestimmt.                       */
/*  Bei bereits bestehendem Mandant, springt die Ansicht auf diesen.            */
/*                                                                              */
/*  Folgende Funktionen sind vorhanden:                                         */
/*                                                                              */
/*  - getScriptButton1Name                                                      */
/*  - eloScriptButton1Start                                                     */
/*  - counter                                                                   */
/*                                                                              */
/*  Copyright (c) Optive AG - 26.05.2020 - AS                                   */
/*                                                                              */
/*------------------------------------------------------------------------------*/



/*------------------------------------------------------------------------------*/
/* Das Package für den JavaClient wird importiert.                              */
/*------------------------------------------------------------------------------*/
importPackage(Packages.de.elo.client);
importPackage(Packages.de.elo.ix.client);
importPackage(Packages.de.elo.client.scripting.items);
importPackage(Packages.de.elo.client.scripting.interfaces);
/*------------------------------------------------------------------------------*/
//@include lib_opt
//@include lib_config_TR
/*------------------------------------------------------------------------------*/



/*------------------------------------------------------------------------------*/
/* Alle Konstanten und die globalen Variablen werden definiert.                 */
/*------------------------------------------------------------------------------*/
const TITEL          = "OTR Neues Mandanten Dossier anlegen";
/*------------------------------------------------------------------------------*/



/*------------------------------------------------------------------------------*/
/* Diese Funktion wird beim Klick auf die Schaltfläche aufgerufen.              */
/*------------------------------------------------------------------------------*/
function eloScriptButton1Start()
{
  var _mandant = "";
  var _mandantNr = "";
  var _countNr;
  var _childrenIDArray = [];
  var _childrenchildrenIDArray = [];
  var _bereich;
  var _idBereich;
  var _register;
  var _idRegister;


  _countNr = counter();
  
  _mandant = workspace.showInputBox(TITEL, "Wie soll der neue Mandant heissen?", "", 1, 100, false, -1);
  if(_mandant != "" && _mandant != null){
    _mandantNr = workspace.showInputBox(TITEL, "Wie lautet die neue MandantenNr?", "" + _countNr + "", 1, 100, false, -1);
    if(_mandantNr != "" && _mandantNr != null){

        // Der übergebene Kandidat wird anhand der Kandidaten Nr gesucht.
        _FindI                             = new FindInfo();
        _FindI.findByIndex                 = new FindByIndex();
        _FindI.findByIndex.maskId          = lib_config_TR.MASK_MANDOS;
        _FindI.findByIndex.objKeys         = [ new ObjKey()];
        _FindI.findByIndex.objKeys[0].id   = 1;
        _FindI.findByIndex.objKeys[0].name = "MANDANTID";
        _FindI.findByIndex.objKeys[0].data = [_mandantNr];
        _FindR = ixConnect.ix().findFirstSords(_FindI, 1, SordC.mbAll);
        ixConnect.ix().findClose(_FindR.searchId);
        
        // Mandant anlegen, falls er nicht exisitert.
        // Falls er existiert, dann auf Mandant springen.
        if(_FindR.sords.length < 1){
          _dosElem = archive.getElement(1);
  	      _sord = _dosElem.prepareStructure(lib_config_TR.MASK_MANDOS);
        
          _sord.name = _mandant + " | " + _mandantNr;
          _sord.objKeys[0].data = [_mandant];
          _sord.objKeys[1].data = [_mandantNr];
          _sord.objKeys[3].data = ["Aktiv"];
          
          _dosElem = _dosElem.addStructure(_sord);
          
          // Holt alle ID's bis zur ersten Ebene.
          _childrenIDArray = getObjectsInDossier(lib_config_TR.OBJID_ZZZ_MANSTR);
          
          for(_i=0; _i<_childrenIDArray.length; _i++) {
            // Legt Bereich an, skippt DokArt.
            _bereich = lib_opt.getSord(_childrenIDArray[_i]).name;
            if(_bereich != "DokArt" && _bereich != "_Posteingang") {
              _path = "¶" + _mandant + " | " + _mandantNr + "¶" + _bereich;
              _idBereich = lib_opt.preparePathOpt("1", _path, lib_config_TR.MASK_FOLDER, null);
              lib_opt.writeMapValue(_idBereich, "DOKART1", _bereich);
            }
            
            // Holt alle ID's bis zur ersten Ebene in einem Bereich.
            _childrenchildrenIDArray = getObjectsInDossier(_childrenIDArray[_i]);
            
            for(_j=0; _j<_childrenchildrenIDArray.length; _j++){
              // Legt Register an, skippt DokArt.
              _register = lib_opt.getSord(_childrenchildrenIDArray[_j]).name;
              if(_register != "DokArt") {
                _path = "¶" + _mandant + " | " + _mandantNr + "¶" + _bereich + "¶" + _register;
                _idRegister = lib_opt.preparePathOpt("1", _path, lib_config_TR.MASK_FOLDER, null);
                lib_opt.writeMapValue(_idRegister, "DOKART1", _register);
              }
            }
          }
          
          // Legt _Posteingang Struktur an.
          if(lib_config_TR.POSTEINGANG_ORDNER){
            _path = "¶" + _mandant + " | " + _mandantNr + "¶_Posteingang¶Kreditoren¶00 BarcodeServer¶Input";
            lib_opt.preparePathOpt("1", _path, lib_config_TR.MASK_FOLDER, null);
            
            _path = "¶" + _mandant + " | " + _mandantNr + "¶_Posteingang¶Kreditoren¶01 unverschlagwortet";
            lib_opt.preparePathOpt("1", _path, lib_config_TR.MASK_FOLDER, null);
            
            _path = "¶" + _mandant + " | " + _mandantNr + "¶_Posteingang¶Kreditoren¶02 indiziert";
            lib_opt.preparePathOpt("1", _path, lib_config_TR.MASK_FOLDER, null);
            
            _path = "¶" + _mandant + " | " + _mandantNr + "¶_Posteingang¶Kreditoren¶Import Error Kreditor";
            lib_opt.preparePathOpt("1", _path, lib_config_TR.MASK_FOLDER, null);
          }
          
          _pObjId = _dosElem.getId();
          workspace.gotoId(_pObjId);	
        }else{
          workspace.showAlertBox(TITEL, "Diese Mandant Nr ist bereits vergeben.");
          workspace.gotoId(_FindR.sords[0].id);
          return;
        }
    }
  }	
}
/*------------------------------------------------------------------------------*/



/*------------------------------------------------------------------------------*/
/* Diese Funktion setzt den Counter für die Mandantennummer.                    */
/*------------------------------------------------------------------------------*/
function counter()
{
  var _countI;
  var _Zaehlername = "MANDANTCOUNT";
  
  
  try {
    // die Infos des gewählten Zählers werden ausgelesen und der Variable _countI zugeordnet
    _countI = ixc.checkoutCounters([_Zaehlername], false, LockC.NO);
    _countI = _countI[0].value;
  }
  catch(ex) {
    // falls Zähler noch nicht existent wird er angelegt
    _countI = workspace.incCounter(_Zaehlername, 1);
    _countI = "1";
  }
            
  // Der neue Zählerstand wird gesetzt
  workspace.incCounter(_Zaehlername, 1); 
  
  return _countI;
}
/*------------------------------------------------------------------------------*/



/*------------------------------------------------------------------------------*/
/* Diese Funktion sucht alle Objekt Level 1 im Dossier mit der übergebenen ID   */
/* und gibtihre ID's in einem Array zurück.                                     */
/*------------------------------------------------------------------------------*/
function getObjectsInDossier(_objId)
{
  // Die lokalen Variablen werden deklariert.
  var _FindI;
  var _FindR;
  var _i;
  var _objIds = [];

  // Alle Objekte unterhalb des Dossiers werden gesucht.
  _FindI                         = new FindInfo();
  _FindI.findChildren            = new FindChildren();
  _FindI.findChildren.parentId   = _objId;
  _FindI.findChildren.mainParent = true;
  _FindI.findChildren.endLevel   = 1;
  _FindR                         = ixConnect.ix().findFirstSords(_FindI, 1000, SordC.mbOnlyId);
  ixConnect.ix().findClose(_FindR.searchId);

  // Die Ids aller Objekte werden in einem Array gespeichert.
  for(_i=0; _i<_FindR.ids.length; _i++) {
    _objIds.push(_FindR.ids[_i]);
  }

  // Das Array wird zurückgegeben.
  return _objIds;
}
/*------------------------------------------------------------------------------*/