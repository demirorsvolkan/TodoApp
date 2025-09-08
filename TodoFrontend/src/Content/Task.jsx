import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getSubTasks,
  addSubTask,
  deleteSubTask,
  updateTask,
  updateSubTask, 
  downloadTemplate, 
  uploadSubTaskTemplateFile, 
  forceUploadSubTaskTemplateFile, 
  downloadSubTaskList} from './Api/taskApi'; 
import SubTask from './SubTask';
import { useAuth } from './AuthContext';
import { useNavigate } from "react-router-dom";
import { useDrag, useDrop } from 'react-dnd';
import TrashBin from './TrashBin';

const ItemType = 'TASK';


function Task({ 
  task,
  onDeleteTask,
  onUpdateTask, 
  isConfirmed,
  taskDeleted,
  onConfirmChange,
  onAlertToggle,
  index,
  moveTask,
  setDragging,
  setIsUploading,
  setUploadingMessage,
  forceUploadingState, 
  setForceUploadingState,
  onComplatedTask,
  subTaskDeleting,
  setSubTaskDeleting,
  subTaskDragged,
  setSubTaskDragged}) {

    
const [subTasks, setSubTasks] = useState([]);
const [originalSubTasks, setOriginalSubTasks] = useState([]);
const [completed, setCompleted] = useState(false);
const [visible, setVisible] = useState(true);
const [update, setUpdate] = useState(new Date(task.updateTime).toLocaleDateString());
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [detailClick, setDetailClick] = useState(false);
const [filterClick, setFilterClick] = useState(false);
const { token } = useAuth();
const navigate = useNavigate();
const [isExpanded, setIsExpanded] = useState(false);
const handleToggle = () => setIsExpanded(p => !p);
const [showButton, setShowButton] = useState(task.active);
const [isUpdating, setIsUpdating] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);
const [isActive, setIsActive] = useState(task.active);
const menuRef = useRef();
const updateRef = useRef();
const filterRef = useRef();
const detailRef = useRef();
const addRef = useRef();
const [isSubTaskDeleted,setIsSubTaskDeleted] = useState(0);
const fileInputRef = useRef(null);
const [excelFile, setExcelFile] = useState(null);
const [subTaskDragging,setSubTaskDragging] = useState(false);



const [filterParam, setFilterParam] = useState({
  filter_no: true,
  filter_active: false,
  filter_completed: false,
  filter_missed: false,
  filter_high: false,
  filter_medium: false,
  filter_low: false,
  deadline_start: "",
  deadline_end: "",
  deadline_all: true,
  created_start: "",
  created_end: "",
  created_all: true,
  updated_start: "",
  updated_end: "",
  updated_all: true,
});

const [formData, setFormData] = useState({
  id: 0,
  mainTaskId: task.id,
  subTaskOrder:0,
  name: '',
  description: '',
  priority: 'Low',
  active: true,
  deadline: '',
  creationTime: new Date().toISOString(),
  updateTime: new Date().toISOString(),
});
const [taskFormData, setTaskFormData] = useState({
  id: task.id,
  categoryId: task.categoryId,
  taskOrder:0,
  name: task.name,
  description: task.description,
  priority: task.priority,
  active: isActive,
  deadline: task.deadline ? new Date(task.deadline).toISOString() : '',
  creationTime: task.creationTime || new Date().toISOString(),
  updateTime: new Date().toISOString(),
});

const [, drop] = useDrop({
  accept: ItemType,
  hover(item, monitor) {
    if (!menuRef.current) return;
    const dragIndex = item.index, hoverIndex = index;
    if (dragIndex === hoverIndex) return;
    const rect = menuRef.current.getBoundingClientRect();
    const hoverMiddleX = (rect.right - rect.left) / 2;
    const hoverClientX = monitor.getClientOffset().x - rect.left;
    if ((dragIndex < hoverIndex && hoverClientX < hoverMiddleX) ||
        (dragIndex > hoverIndex && hoverClientX > hoverMiddleX)) return;
    moveTask(dragIndex, hoverIndex);
    item.index = hoverIndex;
  },
});
const [{ isDragging }, drag] = useDrag({
  type: ItemType,
  item: { id: task.id, index, type: ItemType },
  collect: monitor => ({ isDragging: monitor.isDragging() }),
});
drag(drop(menuRef));

const moveSubTask = useCallback((dragIndex, hoverIndex) => {
    setSubTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      const [removed] = updatedTasks.splice(dragIndex, 1);
      updatedTasks.splice(hoverIndex, 0, removed);
      return updatedTasks;
    });
  }, []);

  useEffect(() => {
      setDragging(isDragging)
}, [isDragging]);






const onChangeFilter = (e) => {
  const { name, type, checked, value } = e.target;
  setFilterParam(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};




const filters = {
  byActive: (subTask) =>
    subTask.active === true && new Date(subTask.deadline) > new Date(),
  byCompleted: (subTask) =>
    subTask.active === false && new Date(subTask.deadline) > new Date(),
  byMissed: (subTask) =>
    subTask.active === true && new Date(subTask.deadline) < new Date(),

  byLow:    (subTask) => (subTask.priority || "").toLowerCase() === "low",
  byMedium: (subTask) => (subTask.priority || "").toLowerCase() === "medium",
  byHigh:   (subTask) => (subTask.priority || "").toLowerCase() === "high",

  byDeadline: (subTask, deadline_start, deadline_end) =>
    new Date(subTask.deadline) >= deadline_start && new Date(subTask.deadline) <= deadline_end,
  byCreated: (subTask, created_start, created_end) =>
    new Date(subTask.creationTime) >= created_start && new Date(subTask.creationTime) <= created_end,
  byUpdated: (subTask, updated_start, updated_end) =>
    new Date(subTask.updateTime) >= updated_start && new Date(subTask.updateTime) <= updated_end,
};

let activeFilters = [];
let priorityFilters = [];
let deadlineFilters = [];
let createdFilters = [];
let updatedFilters = [];


function handleFilterSubTasks(){
    activeFilters = [];
    priorityFilters = [];
    deadlineFilters = [];
    createdFilters = [];
    updatedFilters = [];
    if(filterParam.filter_active){
      activeFilters.push(filters.byActive);
    }
    if(filterParam.filter_completed){
      activeFilters.push(filters.byCompleted);
    }
    if(filterParam.filter_missed){
      activeFilters.push(filters.byMissed);
    }
    if(filterParam.filter_high){
      priorityFilters.push(filters.byHigh);
    }
    if(filterParam.filter_medium){
      priorityFilters.push(filters.byMedium);
    }
    if(filterParam.filter_low){
      priorityFilters.push(filters.byLow);
    }
    const MIN_DATE = new Date(0);
    const MAX_DATE = new Date('9999-12-31');

    if (!filterParam.deadline_all) {
      const start = filterParam.deadline_start ? new Date(filterParam.deadline_start) : MIN_DATE;
      const end = filterParam.deadline_end ? new Date(filterParam.deadline_end) : MAX_DATE;

      deadlineFilters.push((subTask) => filters.byDeadline(subTask, start, end));
    } else {
      deadlineFilters.push((subTask) => filters.byDeadline(subTask, MIN_DATE, MAX_DATE));
    }

    if (!filterParam.created_all) {
      const start = filterParam.created_start ? new Date(filterParam.created_start) : MIN_DATE;
      const end = filterParam.created_end ? new Date(filterParam.created_end) : MAX_DATE;

      createdFilters.push((subTask) => filters.byCreated(subTask, start, end));
    } else {
      createdFilters.push((subTask) => filters.byCreated(subTask, MIN_DATE, MAX_DATE));
    }

    if (!filterParam.updated_all) {
      const start = filterParam.updated_start ? new Date(filterParam.updated_start) : MIN_DATE;
      const end = filterParam.updated_end ? new Date(filterParam.updated_end) : MAX_DATE;

      updatedFilters.push((subTask) => filters.byUpdated(subTask, start, end));
    } else {
      updatedFilters.push((subTask) => filters.byUpdated(subTask, MIN_DATE, MAX_DATE));
    }
}
function filterSubTasks(subTasks) {
  return subTasks.filter(subTask => {
    const activePass = activeFilters.some(fn => fn(subTask));
    const priorityPass = priorityFilters.some(fn => fn(subTask));
    const deadlinePass = deadlineFilters.some(fn => fn(subTask));
    const createdPass = createdFilters.some(fn => fn(subTask));
    const updatedPass = updatedFilters.some(fn => fn(subTask));
    return activePass && priorityPass && deadlinePass && createdPass && updatedPass;
  });
}
function onApplyFilters() {
  if(!filterParam.filter_no){
  handleFilterSubTasks(); 
  const filteredTasks = filterSubTasks(originalSubTasks); 
  setSubTasks(filteredTasks);
  }
}
function onClearFilters() {
  setSubTasks(originalSubTasks); 
  setFilterParam({
    filter_no: true,
    filter_active: false,
    filter_completed: false,
    filter_missed: false,
    filter_high: false,
    filter_medium: false,
    filter_low: false,
    deadline_start: "",
    deadlin_end: "",
    deadline_all: true,
    created_start: "",
    created_end: "",
    created_all: true,
    updated_start: "",
    updated_end: "",
    updated_all: true,
  });
}








  useEffect(() => {
    setSubTaskDragged(subTaskDragging)
}, [subTaskDragging]);

async function updateSubTaskFonk(updated) {
  try {
    await updateSubTask(token, updated);
    setSubTasks(s => s.map(st => (st.id === updated.id ? updated : st)));
  } catch (e) { console.error('Task güncelleme başarısız:', e); }
}

const handleEdit = () => { setMenuOpen(false); setIsUpdating(true); };

async function handleUndoComplete() {
  try {
    const updated = { ...task, active: true, updateTime: new Date().toISOString() };
    const data = await updateTask(token, updated);
    setIsActive(true);
    setUpdate(new Date(data.updateTime).toLocaleDateString());
    setMenuOpen(false);
    setTimeout(() => setShowButton(true), 1000);
    setTimeout(() => onComplatedTask(task.id), 100)
  } catch (e) { console.error("Tamamlama hatası:", e); }
}

const handleCancel = () => {
  setIsUpdating(false);
  setTaskFormData({
    id: task.id,
    categoryId: task.categoryId,
    taskOrder:0,
    name: task.name,
    description: task.description,
    priority: task.priority,
    active: isActive,
    deadline: task.deadline ? new Date(task.deadline).toISOString() : null,
    updateTime: new Date().toISOString(),
    creationTime: new Date().toISOString(),
  });
  setError(null);
};

async function handleComplete(task) {
  try {
    const updated = { ...task, active: false, updateTime: new Date().toISOString() };
    const data = await updateTask(token, updated);
    setIsActive(false);
    setUpdate(new Date(data.updateTime).toLocaleDateString());
    setTimeout(() => setShowButton(false), 1000);
    setTimeout(() => onComplatedTask(task.id), 100)
  } catch (e) { console.error("Tamamlama hatası:", e); }
}

  const handleDownloadTemplate = async () => {
      try {
        await downloadTemplate(token);
      } catch (err) {
          console.error('Template indirme hatası:', err);
      }
  };

  const handleUploadTaskTemplateFile = async (event) => {
    const file = event.target.files[0];
    const fileName = file.name;
    const extension = fileName.split('.').pop().toLowerCase();

    if (extension === 'xlsx') {
      console.log('Geçerli .xlsx dosyası');
    } else {
      console.log('Geçersiz dosya uzantısı! Lütfen .xlsx dosyası yükleyin.');
        setUploadingMessage('Geçersiz dosya uzantısı! Lütfen .xlsx dosyası yükleyin.');
        setIsUploading(4)
        return;
    }
    setExcelFile(file);
    if (!file) return;
    try {
      const result = await uploadSubTaskTemplateFile(token, file, task.id);
      if(result && result["0"] &&result["0"][1]==200 && result["0"][2]==200 && result["0"][3]==200 && result["0"][4]==200){
        console.log('Görevler başarıyla yüklendi, yüklenen görev sayısı:', result["0"][0]);
        setUploadingMessage('Görevler başarıyla yüklendi, yüklenen görev sayısı:' + result["0"][0]);
        setIsUploading(1)
      }else if(result && result["1"]){
        console.log('Template Yanlış lütfen yenisini indirin')
        setUploadingMessage('Template Yanlış lütfen yenisini indirin');
        setIsUploading(2)
      }else if(result && Object.keys(result).length > 0){
        console.log("Bazı satırlarda hatalar var:",Object.keys(result));
        setUploadingMessage('Bazı satırlarda hatalar var: ' + Object.keys(result).join(', '));
        setIsUploading(3)
      }else if(result && Object.keys(result).length == 0){
        setUploadingMessage('Bu dosya boş!');
        setIsUploading(4)
      }else{
        setUploadingMessage('Görev yükleme hatası!');
        setIsUploading(4)
      }    
    } catch (error) {
      console.error('Görev yükleme hatası:', error);
        setUploadingMessage('Görev yükleme hatası!');
        setIsUploading(4)
    }
  };

    const handleForceUploadTaskTemplateFile = async (event) => {
      const file = excelFile;
      if (!file) return;
      try {
        const result = await forceUploadSubTaskTemplateFile(token, file, task.id);
        if(result>=0){
          console.log('Görevler başarıyla yüklendi, yüklenen görev sayısı:', result);
          setUploadingMessage('Görevler başarıyla yüklendi, yüklenen görev sayısı:' + result);
          setIsUploading(1)
        }else{
          console.log("Görevler yüklenemedi");
          setUploadingMessage('Görevler yüklenemedi' );
          setIsUploading(4)
        }      
      } catch (error) {
        console.error('Görev yükleme hatası:', error);
          setUploadingMessage('Görev yükleme hatası!');
          setIsUploading(4)
      }
    };


  const openFileDialog = () => {
      fileInputRef.current.click();
  };

  useEffect(() => {
    if(forceUploadingState){
      handleForceUploadTaskTemplateFile();
      setForceUploadingState(false);
    }
  }, [forceUploadingState]);


  const handleSubTaskListDownload = async () => {
try {
        const result = await downloadSubTaskList(token, task.id);
        if(result.status==404){
        setUploadingMessage('Bu Görevde Hiç Alt Görev Yok');
        setIsUploading(4)
        }
      } catch (err) {
          console.error('Görev Listesi indirme hatası:', err);
      }
  };


useEffect(() => {
  if (completed) {
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }
}, [completed]);

const [taskIdToDelete, setTaskIdToDelete] = useState(null);



const deleteSubTaskFonk = id => {
  setTaskIdToDelete(id);
  onAlertToggle(true);
};

useEffect(() => {
  if (isConfirmed && taskIdToDelete && taskIdToDelete!==0) {
    onConfirmChange(false);
    console.log("alt görev siliniyor");
    (async () => {
      try {
        await deleteSubTask(token, taskIdToDelete);
          setIsSubTaskDeleted(taskIdToDelete);
          setTimeout(()=>{
              setSubTasks(s => s.filter(st => st.id !== taskIdToDelete));
              setIsSubTaskDeleted(0);
          },300);
      } catch (e) { console.error('Task silme başarısız:', e); }
      finally {
        setTaskIdToDelete(0);
        onConfirmChange(false);
      }
    })();
  }
}, [isConfirmed, taskIdToDelete]);


const handleChange = e => {
  const { name, value, type, checked } = e.target;
  setTaskFormData(t => ({ ...t, [name]: type === 'checkbox' ? checked : value }));
};
const subTaskHandleChange = e => {
  const { name, value, type, checked } = e.target;
  setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
};

const taskUpdateSubmit = async e => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
    const updateToTask = {
      ...taskFormData,
      id: task.id,
      userId: task.userId,
      deadline: taskFormData.deadline ? new Date(taskFormData.deadline).toISOString() : null,
      updateTime: new Date().toISOString(),
      creationTime: new Date().toISOString(),
    };
    await onUpdateTask(updateToTask);
  } catch (err) {
    setError(err.message || 'Bir hata oluştu');
  } finally {
    setIsUpdating(false);
    setIsActive(taskFormData.active);
    setLoading(false);
  }
};

const subTaskHandleSubmit = async e => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
    const toSend = {
      ...formData,
      mainTaskId: task.id,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      creationTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };
    const result = await addSubTask(token, toSend);
    setSubTasks(s => [result, ...s]);
    setIsExpanded(false);
    setFormData({
      id: 0,
      mainTaskId: task.id,
      subTaskOrder:0,
      name: '',
      description: '',
      priority: 'Low',
      active: true,
      deadline: '',
      creationTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    });
  } catch (err) {
    setError(err.message || 'Bir hata oluştu');
  } finally {
    setLoading(false);
  }
};

const useClickOutside = (ref, handler, when = true, exceptionClasses = []) => {
  useEffect(() => {
    if (!when) return;

    const listener = (e) => {
      const isExceptionClick = exceptionClasses.some((cls) =>
        e.target.closest(`.${cls}`)
      );

      if (isExceptionClick) return;
      if (!ref.current || ref.current.contains(e.target)) return;

      setTimeout(() => {
        handler(e);
      }, 0);
    };

    document.addEventListener("click", listener);
    return () => {
      document.removeEventListener("click", listener);
    };
  }, [handler, when, exceptionClasses]);
};



useClickOutside(filterRef, () => setFilterClick(false), filterClick, [`task-filter_button-${task.id}`]);
useClickOutside(detailRef, () => setDetailClick(false), detailClick, [`detail-button-${task.id}`]);
useClickOutside(updateRef, () => setIsUpdating(false), isUpdating, [`dropdown-list-${task.id}`]);
useClickOutside(menuRef, () => setMenuOpen(false), menuOpen, [`dropdown-trigger-${task.id}`]);
useClickOutside(addRef, () => setIsExpanded(false), isExpanded);


useEffect(() => {
  if (!task?.id) return;
  setLoading(true);
  getSubTasks(token, task.id)
    .then(data => {
      setOriginalSubTasks(data); 
      setSubTasks(data);          
    })
    .catch(e => setError(e.message || 'Bir hata oluştu'))
    .finally(() => setLoading(false));
}, [task]);




useEffect(() => {
  if (
    subTaskDeleting &&
    subTaskDeleting.id !== 0 &&
    subTaskDeleting.mainTaskId === task.id
  ) {
    deleteSubTaskFonk(subTaskDeleting.id);
    setSubTaskDeleting({ id: 0, mainTaskId: 0 });
  }
}, [subTaskDeleting]);



function formatDeadline(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const monthNames = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const day = date.getDate(), monthName = monthNames[date.getMonth()], year = date.getFullYear();
  return year !== now.getFullYear() ? `${day} ${monthName} ${year}` : `${day} ${monthName}`;
}

function getDeadlineColor(dateString) {
  if (!dateString) return '';
  const diffDays = (new Date(dateString) - new Date()) / (1000*60*60*24);
  if (diffDays <= 3) return 'deadline-soon';
  if (diffDays <= 7) return 'deadline-medium';
  return 'deadline-normal';
}

if (loading) return <p>Yükleniyor...</p>;
if (error) return <p>Hata: {error}</p>;




 return (
  <div
    className={`task-box ${taskDeleted === task.id ? 'deleted' : ''}`}
    ref={updateRef}
    style={{ opacity: isDragging ? 0 : 1}}
  >
    {!isUpdating && (
      <>
        {!isActive ? (
          <div className="overlay" /> 
        ) : new Date(task.deadline) < new Date() && <div className="pass-overlay" />}

        <div className="task-wrapper">
          <button
            className={`detail-button ${detailClick ? 'active' : ''} detail-button-${task.id}`}
            onClick={() =>setTimeout(() => {setDetailClick(prev => !prev)}, 0)} 
          />
          <button className={`task-filter_button task-filter_button-${task.id}`} onClick={() =>setTimeout(() => {setFilterClick(prev => !prev)}, 0)} ></button>
          <div className={`dropdown-trigger dropdown-trigger-${task.id}`} onClick={() => {setMenuOpen(!menuOpen); console.log("aaa",menuOpen)}}>...</div>
          <div className="task-header" ref={menuRef}>
            {menuOpen && (
              <ul className={`dropdown-list task dropdown-list-${task.id}`}>
                <li onClick={handleSubTaskListDownload}>Alt Görevleri İndir</li>
                <li onClick={handleEdit}>Düzenle</li>
                {!isActive && <li onClick={handleUndoComplete}>Tamamlanmadı</li>}
                <li onClick={() => { onDeleteTask(task.id); setMenuOpen(false); }}>Sil</li>
              </ul>
            )}
            <h4 className={`task-name ${detailClick ? 'expand' : ''}`}>{task.name}</h4>
          </div>

          <div className="task-info">
            <div className="tags">
              <span
                className={`status ${
                  isActive ? (new Date(task.deadline) < new Date() ? 'missed' : 'active') : 'completed'
                }`}
              >
                {isActive ? (new Date(task.deadline) < new Date() ? 'Kaçırıldı' : 'Aktif') : 'Tamamlandı'}
              </span>

              <span className={`priority ${task.priority.toLowerCase()}`}>{(task.priority).toUpperCase()}</span>
              <span className={`deadline ${getDeadlineColor(task.deadline)}`}>{formatDeadline(task.deadline)}</span>
            </div>

            {showButton && (
              <button className="complete-button" onClick={() => handleComplete(task)} disabled={!isActive}>
                {isActive ? '' : 'Tamamlandı'}
              </button>
            )}
          </div>

          <div className="content-box">
            <ul>
              <li>
                <div className={`task-filters ${filterClick ? 'expand' : ''}`} ref={filterRef}>
                  {filterClick &&
                  <div className='task-filters-wrapper'>
                    <h1 style={{marginBottom:'10px'}}>Filtrele</h1>
                    <div>
                         <label htmlFor="filter_active" style={{fontSize:'1rem', fontWeight:'bold', color: '#333'}}>Filtreleme Yok &nbsp;&nbsp;</label>
                          <input
                            type="checkbox"
                            name="filter_no"
                            checked={filterParam.filter_no}
                            className="form-input"
                            onChange={onChangeFilter}
                            style={{marginBottom:'20px'}}
                          /><br />
                    </div>
                    <form>
                      <div className='form-first_section'>
                        <div>
                          <label className="form-label">Aktiflik</label>
                          <input
                            type="checkbox"
                            name="filter_active"
                            checked={filterParam.filter_active}
                            className="form-input"
                            disabled={filterParam.filter_no}
                            onChange={onChangeFilter}
                          />
                          <label htmlFor="filter_active"> Aktif</label><br />

                          <input
                            type="checkbox"
                            name="filter_completed"
                            checked={filterParam.filter_completed}
                            className="form-input"
                            disabled={filterParam.filter_no}
                            onChange={onChangeFilter}
                          />
                          <label htmlFor="filter_completed"> Tamamlandı</label><br />

                          <input
                            type="checkbox"
                            name="filter_missed"
                            checked={filterParam.filter_missed}
                            className="form-input"
                            disabled={filterParam.filter_no}
                            onChange={onChangeFilter}
                          />
                          <label htmlFor="filter_missed"> Kaçırıldı</label><br />
                        </div>

                        <div>
                          <label className="form-label">Öncelik</label>
                          <input
                            type="checkbox"
                            name="filter_high"
                            checked={filterParam.filter_high}
                            className="form-input"
                            disabled={filterParam.filter_no}
                            onChange={onChangeFilter}
                          />
                          <label htmlFor="filter_high"> Yüksek</label><br />

                          <input
                            type="checkbox"
                            name="filter_medium"
                            checked={filterParam.filter_medium}
                            className="form-input"
                            disabled={filterParam.filter_no}
                            onChange={onChangeFilter}
                          />
                          <label htmlFor="filter_medium"> Orta</label><br />

                          <input
                            type="checkbox"
                            name="filter_low"
                            checked={filterParam.filter_low}
                            className="form-input"
                            disabled={filterParam.filter_no}
                            onChange={onChangeFilter}
                          />
                          <label htmlFor="filter_low"> Düşük</label><br />
                        </div>
                      </div>

                      <label className='form-label'>Son Tarih</label>
                        <div className='form-date-group'>
                          <div className='form-date_label-group'>
                            <label htmlFor="deadline_start">En Erken</label>
                            <input
                              type="datetime-local"
                              name="deadline_start"
                              disabled={filterParam.deadline_all}
                              className="form-input"
                              style={{ maxWidth: "140px" }}
                              value={filterParam.deadline_start}
                              onChange={onChangeFilter}
                            />
                          </div>
                          <div className='form-date_label-group'>
                            <label htmlFor="deadline_end">En Geç</label>
                            <input
                              type="datetime-local"
                              name="deadline_end"
                              disabled={filterParam.deadline_all}
                              className="form-input"
                              style={{ maxWidth: "140px" }}
                              value={filterParam.deadline_end}
                              onChange={onChangeFilter}
                            />
                          </div>
                          <div className='form-date_checkbox-group'>
                            <input
                              type="checkbox"
                              name="deadline_all"
                              checked={filterParam.deadline_all}
                              className="form-input"
                              disabled={filterParam.filter_no}
                              onChange={onChangeFilter}
                            />
                            <label htmlFor="deadline_all">Hepsi</label>
                          </div>
                        </div>

                        <label className='form-label'>Oluşturulma Tarihi</label>
                        <div className='form-date-group'>
                          <div className='form-date_label-group'>
                            <label htmlFor="created_start">En Erken</label>
                            <input
                              type="datetime-local"
                              name="created_start"
                              disabled={filterParam.created_all}
                              className="form-input"
                              style={{ maxWidth: "140px" }}
                              value={filterParam.created_start}
                              onChange={onChangeFilter}
                            />
                          </div>
                          <div className='form-date_label-group'>
                            <label htmlFor="created_end">En Geç</label>
                            <input
                              type="datetime-local"
                              name="created_end"
                              disabled={filterParam.created_all}
                              className="form-input"
                              style={{ maxWidth: "140px" }}
                              value={filterParam.created_end}
                              onChange={onChangeFilter}
                            />
                          </div>
                          <div className='form-date_checkbox-group'>
                            <input
                              type="checkbox"
                              name="created_all"
                              checked={filterParam.created_all}
                              className="form-input"
                              disabled={filterParam.filter_no}
                              onChange={onChangeFilter}
                            />
                            <label htmlFor="created_all">Hepsi</label>
                          </div>
                        </div>

                        <label className='form-label'>Son Güncellenme Tarihi</label>
                        <div className='form-date-group'>
                          <div className='form-date_label-group'>
                            <label htmlFor="updated_start">En Erken</label>
                            <input
                              type="datetime-local"
                              name="updated_start"
                              disabled={filterParam.updated_all}
                              className="form-input"
                              style={{ maxWidth: "140px" }}
                              value={filterParam.updated_start}
                              onChange={onChangeFilter}
                            />
                          </div>
                          <div className='form-date_label-group'>
                            <label htmlFor="updated_end">En Geç</label>
                            <input
                              type="datetime-local"
                              name="updated_end"
                              disabled={filterParam.updated_all}
                              className="form-input"
                              style={{ maxWidth: "140px" }}
                              value={filterParam.updated_end}
                              onChange={onChangeFilter}
                            />
                          </div>
                          <div className='form-date_checkbox-group'>
                            <input
                              type="checkbox"
                              name="updated_all"
                              checked={filterParam.updated_all}
                              className="form-input"
                              disabled={filterParam.filter_no}
                              onChange={onChangeFilter}
                            />
                            <label htmlFor="updated_all">Hepsi</label>
                          </div>
                        </div>

                    </form>
                  </div>}
                  {filterClick && 
                  <div className='form-footer'>
                    



                    <div className="form-buttons">
                    <div className='form-ok_buttons'>
                        <button type="button" className="btn btn-cancel" onClick={onClearFilters}>
                          Temizle
                        </button>
                        <button type="button"  className="btn btn-submit" onClick={onApplyFilters}>
                          Uygula
                        </button>
                    </div>
                  </div>










                    
                  </div>}
                </div>
                </li>
              <li>
                <p className={`task-description ${detailClick ? 'expand' : ''}`} ref={detailRef}>{task.description}</p>
                {detailClick && (
                  <div className="dates">
                    <span>Oluşturulma Zamanı: {new Date(task.creationTime).toLocaleDateString('tr-TR')}</span>
                    <span>Son Güncelleme: {new Date(task.updateTime).toLocaleDateString('tr-TR')}</span>
                  </div>
                )}

                <div
                  className={`expandable-box ${isExpanded ? 'expanded' : 'collapsed'}`}
                  onClick={!isExpanded ? () => setIsExpanded(true) : undefined}
                  ref={addRef}
                  style={{ cursor: 'pointer', padding: 10, border: '1px solid #ccc', marginBottom: 10 }}
                >
                  {!isExpanded ? (
                    'Yeni Görev Ekle'
                  ) : (
                    <form onClick={e => e.stopPropagation()} onSubmit={subTaskHandleSubmit} className="expandable-box-form">
                      <label className="form-label">
                        Görev Adı
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={subTaskHandleChange}
                          required
                          disabled={loading}
                          className="form-input"
                        />
                      </label>

                      <label className="form-label">
                        Açıklama
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={subTaskHandleChange}
                          rows={3}
                          required
                          disabled={loading}
                          className="form-textarea"
                        />
                      </label>

                      <label className="form-label">
                        Öncelik
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={subTaskHandleChange}
                          required
                          disabled={loading}
                          className="form-select"
                        >
                          <option value="Low">Düşük</option>
                          <option value="Medium">Orta</option>
                          <option value="High">Yüksek</option>
                        </select>
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="active"
                          checked={formData.active}
                          onChange={subTaskHandleChange}
                          disabled={loading}
                          className="form-checkbox"
                        />
                        Aktif
                      </label>

                      <label className="form-label">
                        Son Tarih
                        <input
                          type="datetime-local"
                          name="deadline"
                          value={formData.deadline}
                          onChange={subTaskHandleChange}
                          required
                          disabled={loading}
                          className="form-input"
                        />
                      </label>

                      {error && <div className="form-error">Hata: {error}</div>}
                  <div className="form-buttons">
                    <div className='form-upload_buttons'>
                    <button type='button' className='btn btn-upload' onClick={openFileDialog}>Yükle</button>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleUploadTaskTemplateFile}
                    />   
                      <a href="#" className='form-template' onClick={e => { e.preventDefault(); handleDownloadTemplate(); }}>Template'i İndir</a>
                    </div>
                    <div className='form-ok_buttons'>
                          <button type="submit" disabled={loading} className="btn btn-submit">
                          {loading ? 'Ekleniyor...' : 'Ekle'}
                        </button>
                        <button type="button" onClick={() => setIsExpanded(false)} disabled={loading} className="btn btn-cancel">
                          İptal
                        </button>
                    </div>
                  </div>
                    </form>
                  )}
                </div>
              </li>
              {subTasks.map((subTask, index) => (
                <SubTask
                  key={subTask.id}
                  subTask={subTask}
                  onDeleteSubtask={deleteSubTaskFonk}
                  onUpdateSubtask={updateSubTaskFonk}
                  subTaskDeleted={isSubTaskDeleted}
                  index={index}
                  moveSubTask={moveSubTask}
                  setDragging={setSubTaskDragging}
                />
              ))}
            </ul>
          </div>
        </div>
      </>
    )}

    {isUpdating && (
      <form onSubmit={taskUpdateSubmit} className="task-form">
        <label style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>Güncelle</label>

        <label className="form-label">
          Görev Adı
          <input
            type="text"
            name="name"
            value={taskFormData.name}
            onChange={handleChange}
            required
            disabled={loading}
            className="form-input"
          />
        </label>

        <label className="form-label">
          Açıklama
          <textarea
            name="description"
            value={taskFormData.description}
            onChange={handleChange}
            rows={3}
            required
            disabled={loading}
            className="form-textarea"
          />
        </label>

        <label className="form-label">
          Öncelik
          <select
            name="priority"
            value={taskFormData.priority}
            onChange={handleChange}
            required
            disabled={loading}
            className="form-select"
          >
            <option value="Low">Düşük</option>
            <option value="Medium">Orta</option>
            <option value="High">Yüksek</option>
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="active"
            defaultChecked={isActive}
            onChange={handleChange}
            disabled={loading}
            className="form-checkbox"
          />
          Aktif
        </label>

        <label className="form-label">
          Son Tarih
          <input
            type="datetime-local"
            name="deadline"
            value={
              taskFormData.deadline
                ? new Date(new Date(taskFormData.deadline).getTime() + 3 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 16)
                : ''
            }
            onChange={handleChange}
            required
            disabled={loading}
            className="form-input"
          />
        </label>

        {error && <div className="form-error">Hata: {error}</div>}

        <div className="form-buttons">
          <button type="submit" disabled={loading} className="btn btn-submit">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button type="button" onClick={handleCancel} disabled={loading} className="btn btn-cancel">
            İptal
          </button>
        </div>
      </form>
    )}
  </div>
);


}

export default Task;
