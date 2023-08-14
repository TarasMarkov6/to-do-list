"use strict";
const createNoteBtnBlock = document.querySelector (".create_note_button");
const createNoteBtn = createNoteBtnBlock.querySelector ("button");

const notes = {
	isArchivateNotesVisible: false,
	
	setNotesHandlers () {
		this.deleteNoteHandler ();
		this.deleteAllNotesHandler ();
		this.archivateExtractNoteHandler ();
		this.showHideArchivatedNotesHandler ();
		this.editNote ();
		this.setSummaryValues ();
		this.contentWindowHandler ();
	},
	deleteNoteHandler () {
		document.addEventListener("click",(e)=>{
			if (e.target.parentElement.classList.contains ("delete_icon")) {
				const elem = e.target.closest (".noteShell");
				const id = elem.id;
				elem.remove ();
				delete this[id];
				
				this.setSummaryValues ();
			}
		})
	},
	deleteAllNotesHandler () {
		document.addEventListener("click",(e)=>{
			if (e.target.parentElement.classList.contains ("title_delete_icon")) {
				for (let key in this) {
					if (typeof this[key] != "function" && this[key].block) {
						this[key].block.remove();
						delete this[key];
					};
				}
				
				this.setSummaryValues ();
			}
		})
	},
	archivateExtractNoteHandler () {
		document.addEventListener("click",(e)=>{
			if (e.target.parentElement.classList.contains ("archivate_icon")) {
				const elem = e.target.closest (".noteShell");
				const id = elem.id;
				
				const icons = e.target.parentElement.children;
				[...icons].forEach(item => item.hidden = !item.hidden);
				
				this.changeNoteStatus (id);
				
				if (!this.isArchivateNotesVisible) {
					elem.style.display = "none";
				} else elem.style.display = "block";
				
				this.setSummaryValues ();
			}
		})
	},
	showHideArchivatedNotesHandler () {
		document.addEventListener("click",(e)=>{
			if (e.target.parentElement.classList.contains ("title_archivate_icon")) {
				if (!this.isArchivateNotesVisible) {
					this.showArchivatedNotes ();
				} else {
					this.hideArchivatedNotes ();
				}
			}
		})
	},
	showArchivatedNotes () {
		for (let key in this) {
			if (typeof this[key] != "function" && !this[key].isActive && key != "isArchivateNotesVisible") {
				this[key].block.style.display = "block";
			}
		}
		this.changeArchivatedVisibilityStatus ();
	},
	hideArchivatedNotes () {
		for (let key in this) {
			if (typeof this[key] != "function" && !this[key].isActive && key != "isArchivateNotesVisible") {
				this[key].block.style.display = "none";
			}
		}
		this.changeArchivatedVisibilityStatus ();
	},
	editNote () {
		document.addEventListener("click",(e)=>{
			if (e.target.parentElement.classList.contains ("edit_icon")) {
				const elem = e.target.closest (".noteShell");
				const nameBlock = elem.querySelector (".second > div")
				const id = elem.id;
				noteWindow.showCreatNoteWindow (false,id,elem);
			}
		})
	},
	setSummaryValues () {
		const notesArray = [];
		for (let key in this) {
			if (typeof this[key] != "function" && key != "isArchivateNotesVisible") {
				notesArray.push(this[key]);
			}
		}
		const active = Array.from (document.querySelector ("#summary").querySelectorAll (".active_quantity"));
		const archived = Array.from (document.querySelector ("#summary").querySelectorAll (".archived_quantity"));
		
		active.forEach (block => {
			const category = block.dataset.category;
			const filtred = notesArray.filter (note => note.category == category && note.isActive);
			block.querySelector ("div").textContent = filtred.length;
		});

		archived.forEach (block => {
			const category = block.dataset.category;
			const filtred = notesArray.filter (note => note.category == category && !note.isActive);
			block.querySelector ("div").textContent = filtred.length;
		});
	},
	addNotesByHand (id,name,content,category,date,isActive) {
		const note = new Note(name,category,content);
		note.id = id;
		note.isActive = isActive;
		note.date = date;

		this[id] = note;

		const showNote = new ShowNote (true);
		this[id].block = showNote.render (note.name,note.category,note.content,note.date,note.dates,note.id);
		if (isActive == true) {
			this[id].block.querySelector("[alt='archivate']").hidden = false;
			this[id].block.querySelector("[alt='extract']").hidden = true;
		} else {
			this[id].block.querySelector("[alt='archivate']").hidden = true;
			this[id].block.querySelector("[alt='extract']").hidden = false;			
		}

		this.hideArchivatedNotes ();
		this.changeArchivatedVisibilityStatus ();
		this.setSummaryValues ();
	},
	changeNoteStatus (id) {
		this[id].isActive = !this[id].isActive;
	},
	changeArchivatedVisibilityStatus () {
		this.isArchivateNotesVisible = !this.isArchivateNotesVisible;
	},
	contentWindowHandler () {
		let isWindowCreated = false;
		document.addEventListener ("click",(e)=>{
			if (e.target.closest (".content_container") && isWindowCreated == false) {
				const note = e.target.closest(".noteShell");
				const contentWindow = new ContentWindow (note);
				const button = contentWindow.createContentWindow ();
				isWindowCreated = true;

				button.addEventListener ("click",function () {
					contentWindow.deleteContentWindow ();
					isWindowCreated = false;
				});
			}
		})
	}
};

class Note {
	constructor (name,category,content) {
		this.name = name.value || name;
		this.category = category.value || category;
		this.content = content.value || content;
		this.isActive = true;
		const currentDate = new Date();
		const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		this.date = `${month[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
		const datesInContent = this.content.match(/(\d{1,2})(\/)(\d{1,2})(\/)((\d\d)+)/g) || [];
		this.dates = datesInContent.join(', ');
		this.id = Note.id;
	}

	addNoteToNotesObj () {
		notes[Note.id] = this;
		Note.id++;
	}

	static id = 0;
}

class ShowNote {
	constructor (status,editedElement) {
		this.isCreation = status;
		this.editedElement = editedElement;
		this.iconsURL = {
			"Task": "./img/shopping_cart_icon.png",
			"Random Thought": "./img/random_thought_icon.png",
			"Quote": "./img/quote_icon.png",
			"Idea": "./img/idea_icon.png",
		}
	}
	
	render (name,category,content,date,dates,id) {
		let note;
		let noteShell;
		if (this.isCreation) {
			note = document.querySelector ("#new_note").content.cloneNode (true);
			noteShell = document.createElement ("div");
			noteShell.classList.add ("noteShell");
			noteShell.id = id;
		} else note = this.editedElement;

		const noteContentBlocks = note.querySelectorAll (".column > div");
		const [iconBlock,nameBlock,createdBlock,categoryBlock,contentBlock,datesBlock,] = [...noteContentBlocks];

		iconBlock.style.backgroundImage = `URL(${this.iconsURL[category]})`
		nameBlock.textContent = name;
		createdBlock.textContent = date;
		categoryBlock.textContent = category;
		contentBlock.textContent = content.length < 30 ? content : content.slice(0,20) + "...";
		datesBlock.textContent = dates;
		
		if (this.isCreation) {
		noteShell.append (note);
		createNoteBtnBlock.before (noteShell);
		
		return noteShell;
		}
	}
}

class createNoteWindow {
	constructor () {
		this.block = document.querySelector (".create_note_block");
		this.name = this.block.querySelector ("#name");
		this.category = this.block.querySelector ("#category");
		this.content = this.block.querySelector ("#content");
		this.confirmBtn = this.block.querySelector (".confirm_btn");
		this.cancelBtn = this.block.querySelector (".cancel_btn");
	}

	showCreatNoteWindow (value,id,elem) {
		this.block.style.display = "block";
		this.creationActivity = value;
		this.id = id;
		if (!value) {
			this.setInitialNonEmptyValues (this.id);
			this.currentElement = elem;
		}
	}

	hideCreatNoteWindow () {
		this.block.style.display = "none";
	}

	addConfirmBtnHandler () {
		this.confirmBtn.addEventListener ("click",()=>{
			if (this.creationActivity) {
				if (this.name.value != "" && this.content.value != "") {
					const note = new Note (this.name,this.category,this.content);
					note.addNoteToNotesObj ();
					const showNote = new ShowNote (true);
					note.block = showNote.render (note.name,note.category,note.content,note.date,note.dates,note.id);
					
					notes.setSummaryValues ();
					this.setInitialEmptyValues ();
					this.hideCreatNoteWindow ();
				}				
			} else {
				const editedNote = new Note (this.name,this.category,this.content);
				const showEditedNote = new ShowNote (false,this.currentElement);
				showEditedNote.render (editedNote.name,editedNote.category,editedNote.content,notes[this.id].date,editedNote.dates);				

				this.writeEditedToObj (this.id);
				this.setInitialEmptyValues ();
				this.hideCreatNoteWindow ();
				notes.setSummaryValues ();
			}
		});
	}

	addCancelBtnHandler () {
		this.cancelBtn.addEventListener("click", ()=>{
			this.setInitialEmptyValues ();
			this.hideCreatNoteWindow ();
		})
	}
	
	setInitialEmptyValues () {
		createNoteBtn.style.pointerEvents = "all";
		this.name.value = "";
		this.content.value = "";
		this.category.value = "Task";
	}

	setInitialNonEmptyValues (id) {
		this.name.value = notes[id].name;
		this.content.value = notes[id].content;
		this.category.value = notes[id].category;
	}

	writeEditedToObj (id) {
		notes[id].name = this.name.value;
		notes[id].category = this.category.value;
		notes[id].content = this.content.value;
	}
}

class ContentWindow {
	constructor (note) {
		this.note = note;
	}
	createContentWindow () {
		this.block = document.createElement ("div");
		this.block.classList.add ("content_window");
		this.block.insertAdjacentHTML ("afterbegin",`<div>${notes[this.note.id].content}</div><div><button>Close</button></div>`);
	
		this.note.after(this.block);
				
		return this.block.querySelector ("button");
	}
	deleteContentWindow () {
		this.block.remove ();
	}
}

const noteWindow = new createNoteWindow ();
noteWindow.addConfirmBtnHandler ();
noteWindow.addCancelBtnHandler ();
notes.setNotesHandlers ();

createNoteBtn.addEventListener ("click", function () {
	noteWindow.showCreatNoteWindow (true);
	this.style.pointerEvents = "none";
});

notes.addNotesByHand ("10000","Покупки","Хліб, молоко, цукор","Task","July 20,2023",false);
notes.addNotesByHand ("10001","Важлива дата","День народження похресниці 14/02/2024","Random Thought","July 22,2023",true);
notes.addNotesByHand ("10002","Покупки","Морозиво, цукерки","Task","July 22,2023",false);
notes.addNotesByHand ("10003","Квадрат суми чисел","Квадрат суми чисел є частковим випадком біному Ньютона","Idea","July 24,2023",true);
notes.addNotesByHand ("10004","Альберт Ейнштейн","Прагніть не до успіху, а до цінностей, які він дає","Quote","July 25,2023",true);
notes.addNotesByHand ("10005","Стів Джобс","Єдиний спосіб робити свою роботу добре — це любити її.","Quote","July 26,2023",true);
notes.addNotesByHand ("10006","Покупки","Сірники, порошок для прання","Task","July 26,2023",false);