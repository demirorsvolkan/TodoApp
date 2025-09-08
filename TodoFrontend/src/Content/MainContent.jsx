import Navbar from './Navbar';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getTasks, getCategory, addTask, deleteTask, updateTask, downloadTemplate, uploadTaskTemplateFile, forceUploadTaskTemplateFile, downloadTaskList } from './Api/taskApi';
import Task from './Task';
import Header from './Header';
import { useAuth } from './AuthContext';
import TrashBin from './TrashBin';

function MainContent({ children }) {
  const [filter, setFilter] = useState(1);
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [originalTasks, setOriginalTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollVisible, setScrollVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [isTaskDeleted, setIsTaskDeleted] = useState(0);
  const [isAccept, setIsAccept] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  const [isDragging, setDragging] = useState(false);
  const navbarRef = useRef(null);
  const addRef = useRef();
  const mainRef = useRef();
  const myDropRef = useRef();
  const timeoutRef = useRef(null);
  const filterRef = useRef();
  const { token } = useAuth();
  const followerRef = useRef();
  const fileInputRef = useRef(null);
  const [isUpload, setIsUpload] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [forceUploadInfo, setForceUploadInfo] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const forceTimeoutRef = useRef(null);
  const [forceUploadState, setForceUploadState] = useState(false);
  const [isTaskComplated, setTaskComplated] = useState(0);
  const [subTaskDeleted, setSubTaskDeleted] = useState({ id: 0, mainTaskId: 0 });
  const [subTaskDragged, setSubTaskDragged] = useState(false);
  const [filterClick, setFilterClick] = useState(false);

  const options = [
    { value: true, label: 'Alt Görevlerle Birlikte' },
    { value: false, label: 'Yalnızca Ana Görevler' },
  ];

  const [selected, setSelected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

function onClearFilters() {
  setTasks(originalTasks); 
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


  const initialFormData = {
    name: '',
    description: '',
    priority: 'Low',
    active: true,
    deadline: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const resetFormData = () => {
    setFormData(initialFormData);
    setError(null);
    setIsActive(false);
  };
  /*
    const getTitle = (filter) => {
      const titles = {
        all: 'Tümü',
        active: 'Aktif',
        soon: 'Acil',
        urgent: 'Öncelikli',
        closed: 'Kapalı',
        past: 'Tarihi Geçmiş',
      };
      return titles[filter] || '';
    };
  */


  const toggleForceUploadInfo = () => {
    setForceUploadInfo(prev => {
      if (!prev) {
        if (forceTimeoutRef.current) {
          clearTimeout(forceTimeoutRef.current);
        }
        forceTimeoutRef.current = setTimeout(() => {
          setForceUploadInfo(false);
          forceTimeoutRef.current = null;
        }, 3000);
      } else {
        if (forceTimeoutRef.current) {
          clearTimeout(forceTimeoutRef.current);
          forceTimeoutRef.current = null;
        }
      }
      return !prev;
    });
  };

  const handleTaskListDownload = async (event, withSub) => {
    try {
      const result = await downloadTaskList(token, filter, withSub);
      if (result.status == 404) {
        setUploadMessage('Bu Filtrede Hiç Görev Yok');
        setIsUpload(4)
      }
    } catch (err) {
      console.error('Görev Listesi indirme hatası:', err);
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
      setUploadMessage('Geçersiz dosya uzantısı! Lütfen .xlsx dosyası yükleyin.');
      setIsUpload(4)
      return;
    }
    setExcelFile(file);
    if (!file) return;
    try {
      const result = await uploadTaskTemplateFile(token, file, filter);
      if (result && result["0"] && result["0"][1] == 200 && result["0"][2] == 200 && result["0"][3] == 200 && result["0"][4] == 200) {
        console.log('Görevler başarıyla yüklendi, yüklenen görev sayısı:', result["0"][0]);
        setUploadMessage('Görevler başarıyla yüklendi, yüklenen görev sayısı:' + result["0"][0]);
        setIsUpload(1)
      } else if (result && result["1"]) {
        console.log('Template Yanlış lütfen yenisini indirin')
        setUploadMessage('Template Yanlış lütfen yenisini indirin');
        setIsUpload(2)
      } else if (result && Object.keys(result).length > 0) {
        console.log("Bazı satırlarda hatalar var:", Object.keys(result));
        setUploadMessage('Bazı satırlarda hatalar var: ' + Object.keys(result).join(', '));
        setIsUpload(3)
      } else if (result && Object.keys(result).length == 0) {
        setUploadMessage('Bu dosya boş!');
        setIsUpload(4)
      } else {
        setUploadMessage('Görev yükleme hatası!');
        setIsUpload(4)
      }
    } catch (error) {
      console.error('Görev yükleme hatası:', error);
      setUploadMessage('Görev yükleme hatası!');
      setIsUpload(4)
    }
  };

  const handleForceUploadTaskTemplateFile = async (event) => {
    const file = excelFile;
    if (!file) return;
    try {
      const result = await forceUploadTaskTemplateFile(token, file, filter);
      if (result >= 0) {
        console.log('Görevler başarıyla yüklendi, yüklenen görev sayısı:', result);
        setUploadMessage('Görevler başarıyla yüklendi, yüklenen görev sayısı:' + result);
        setIsUpload(1)
      } else {
        console.log("Görevler yüklenemedi");
        setUploadMessage('Görevler yüklenemedi');
        setIsUpload(4)
      }
    } catch (error) {
      console.error('Görev yükleme hatası:', error);
      setUploadMessage('Görev yükleme hatası!');
      setIsUpload(4)
    }
  };


  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  const handleAddClick = () => setIsActive(true);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const moveTask = useCallback((dragIndex, hoverIndex) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      const [removed] = updatedTasks.splice(dragIndex, 1);
      updatedTasks.splice(hoverIndex, 0, removed);
      return updatedTasks;
    });
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const nowISO = new Date().toISOString();
    const newTask = {
      id: 0,
      categoryId: filter,
      taskOrder: 0,
      name: formData.name,
      description: formData.description,
      priority: formData.priority,
      active: formData.active,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      creationTime: nowISO,
      updateTime: nowISO,
    };

    try {
      const result = await addTask(token, newTask);
      setTasks(prev => [result, ...prev]);
      resetFormData();
    } catch (err) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = (taskId) => {
    setTaskIdToDelete(taskId);
    setIsAlert(true);
  };



  const handelComplateTask = (taskId) => {
    /*
      if(filter!=="all"){
      setTaskComplated(taskId);
      setIsTaskDeleted(taskId);
      }
      */
  }

  useEffect(() => {
    if (isTaskComplated !== 0) {
      try {
        setIsTaskDeleted(isTaskComplated);
        console.log("1 - ", isTaskDeleted)
        setTimeout(() => {
          setTasks(prev => prev.filter(task => task.id !== isTaskComplated));
          console.log("2 - ", isTaskDeleted)
          setTaskComplated(0);
          setIsTaskDeleted(0);
        }, 300);
        console.log("3 - ", isTaskDeleted)
      } catch (error) {
        console.error('Görev tamamlanamadı:', error);
      } finally {

      }
    }
  }, [isTaskComplated, isTaskDeleted]);


  const handleUpdateTask = async (updatedTask) => {
    try {
      await updateTask(token, updatedTask);
      setTasks(prev =>
        prev.map(task => (task.id === updatedTask.id ? updatedTask : task))
      );
    } catch (err) {
      console.error('Task güncelleme hatası:', err);
    }
  };

  const handleCancel = () => resetFormData();

  const handleShowScrollbar = () => {
    setScrollVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setScrollVisible(false), 1500);
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(token);
    } catch (err) {
      console.error('Template indirme hatası:', err);
    }
  };

  useEffect(() => {
    if (isAccept && taskIdToDelete) {
      (async () => {
        try {
          await deleteTask(token, taskIdToDelete);
          setIsTaskDeleted(taskIdToDelete);
          setTimeout(() => {
            setTasks(prev => prev.filter(task => task.id !== taskIdToDelete));
            setIsTaskDeleted(0);
            setDragging(false)
          }, 300);

        } catch (error) {
          console.error('Görev silinemedi:', error);
        } finally {
          setIsAccept(false);
          setTaskIdToDelete(null);
        }
      })();
    }
  }, [isAccept, taskIdToDelete]);

const onChangeFilter = (e) => {
  const { name, type, checked, value } = e.target;
  setFilterParam(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};


const filters = {
  byActive: (task) =>
    task.active === true && new Date(task.deadline) > new Date(),
  byCompleted: (task) =>
    task.active === false && new Date(task.deadline) > new Date(),
  byMissed: (task) =>
    task.active === true && new Date(task.deadline) < new Date(),

  byLow:    (task) => (task.priority || "").toLowerCase() === "low",
  byMedium: (task) => (task.priority || "").toLowerCase() === "medium",
  byHigh:   (task) => (task.priority || "").toLowerCase() === "high",

  byDeadline: (task, deadline_start, deadline_end) =>
    new Date(task.deadline) >= deadline_start && new Date(task.deadline) <= deadline_end,
  byCreated: (task, created_start, created_end) =>
    new Date(task.creationTime) >= created_start && new Date(task.creationTime) <= created_end,
  byUpdated: (task, updated_start, updated_end) =>
    new Date(task.updateTime) >= updated_start && new Date(task.updateTime) <= updated_end,
};

let activeFilters = [];
let priorityFilters = [];
let deadlineFilters = [];
let createdFilters = [];
let updatedFilters = [];

function handleFilterTasks() {
  activeFilters = [];
  priorityFilters = [];
  deadlineFilters = [];
  createdFilters = [];
  updatedFilters = [];

  if (filterParam.filter_active) {
    activeFilters.push(filters.byActive);
  }
  if (filterParam.filter_completed) {
    activeFilters.push(filters.byCompleted);
  }
  if (filterParam.filter_missed) {
    activeFilters.push(filters.byMissed);
  }
  if (filterParam.filter_high) {
    priorityFilters.push(filters.byHigh);
  }
  if (filterParam.filter_medium) {
    priorityFilters.push(filters.byMedium);
  }
  if (filterParam.filter_low) {
    priorityFilters.push(filters.byLow);
  }

  const MIN_DATE = new Date(0);
  const MAX_DATE = new Date("9999-12-31");

  if (!filterParam.deadline_all) {
    const start = filterParam.deadline_start ? new Date(filterParam.deadline_start) : MIN_DATE;
    const end = filterParam.deadline_end ? new Date(filterParam.deadline_end) : MAX_DATE;

    deadlineFilters.push((task) => filters.byDeadline(task, start, end));
  } else {
    deadlineFilters.push((task) => filters.byDeadline(task, MIN_DATE, MAX_DATE));
  }

  if (!filterParam.created_all) {
    const start = filterParam.created_start ? new Date(filterParam.created_start) : MIN_DATE;
    const end = filterParam.created_end ? new Date(filterParam.created_end) : MAX_DATE;

    createdFilters.push((task) => filters.byCreated(task, start, end));
  } else {
    createdFilters.push((task) => filters.byCreated(task, MIN_DATE, MAX_DATE));
  }

  if (!filterParam.updated_all) {
    const start = filterParam.updated_start ? new Date(filterParam.updated_start) : MIN_DATE;
    const end = filterParam.updated_end ? new Date(filterParam.updated_end) : MAX_DATE;

    updatedFilters.push((task) => filters.byUpdated(task, start, end));
  } else {
    updatedFilters.push((task) => filters.byUpdated(task, MIN_DATE, MAX_DATE));
  }
}

function filterTasks(tasks) {
  return tasks.filter((task) => {
    const activePass = activeFilters.some((fn) => fn(task));
    const priorityPass = priorityFilters.some((fn) => fn(task));
    const deadlinePass = deadlineFilters.some((fn) => fn(task));
    const createdPass = createdFilters.some((fn) => fn(task));
    const updatedPass = updatedFilters.some((fn) => fn(task));
    return activePass && priorityPass && deadlinePass && createdPass && updatedPass;
  });
}



function onApplyFilters() {
  if(!filterParam.filter_no){
  handleFilterTasks(); 
  const filteredTasks = filterTasks(originalTasks); 
  setTasks(filteredTasks);
  }
}

  useEffect(() => {
    setLoading(true);
    getCategory(token, filter)
      .then(data => {
        setBoard(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Board yüklenemedi');
        setLoading(false);
      });
    setLoading(true);
    getTasks(token, filter)
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));
        setOriginalTasks(sorted); 
        setTasks(sorted);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Görevler yüklenemedi');
        setLoading(false);
      });
  }, [token, filter]);

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

        useClickOutside(myDropRef, () => setIsOpen(false), isOpen,['mydropdown__list']);
        useClickOutside(filterRef, () => setFilterClick(false), filterClick, [`task-filter_button`]);




  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addRef.current && !addRef.current.contains(e.target)) {
        setIsActive(false);
      }
    };
    if (isActive) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActive]);

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>Hata: {error}</p>;

  return (
    <>
      {isAlert && (
        <div className='delete-overlay'>
          <div className='delete-alert'>
            <p style={{ fontSize: '1.2rem', marginBottom: '3rem' }}>
              Silmek istediğinize emin misiniz?
            </p>
            <div className="button-group">
              <button className="alertBtn alertBtn-danger" onClick={() => {
                setIsAccept(true);
                setIsAlert(false);
              }}>
                Evet
              </button>
              <button className="alertBtn alertBtn-cancel" onClick={() => {
                setIsAccept(false);
                setIsAlert(false);
              }}>
                Hayır
              </button>
            </div>
          </div>
        </div>
      )}

      {isUpload > 0 && (
        <div className='delete-overlay'>
          <div className='delete-alert'>
            <p style={{ fontSize: '1.2rem', marginBottom: '3rem' }}>
              {uploadMessage}
            </p>
            {isUpload != 3 && (
              <div className="button-group">
                <button className="alertBtn alertBtn-ok" onClick={() => {
                  setIsUpload(0);
                  setUploadMessage("")
                }}>
                  Tamam
                </button>
              </div>
            )}
            {isUpload === 3 && (
              <div className="button-group">
                <button className="alertBtn alertBtn-ok" onClick={() => {
                  setIsUpload(0);
                  setUploadMessage("")
                  setForceUploadInfo(false);

                }}>
                  Tamam
                </button>
                <div>
                  <button className="alertBtn alertBtn-danger" onClick={(e) => {
                    setIsUpload(0);
                    setUploadMessage("");
                    setForceUploadInfo(false);
                    setForceUploadState(true);
                    handleForceUploadTaskTemplateFile(e);
                  }}>
                    Zorla Yükle
                  </button>
                  <button onClick={toggleForceUploadInfo}
                    style={{ borderRadius: '10px', padding: '5px', margin: '5px' }} >?</button>
                </div>
              </div>
            )}
            {forceUploadInfo && (
              <p style={{ fontSize: '1rem', padding: '2rem', border: '2px solid #BF381A', borderRadius: '10px', marginTop: '4rem', backgroundColor: 'white' }}>Bu seçenek tıklandığında hatalı olan veriler varsayılan değerler ile veritabanına kaydedilir. Lütfen bunu yapmak istediğinizden emin olun.</p>
            )}
          </div>
        </div>
      )}

      <Header />
      <main
        ref={mainRef}
        onScroll={handleShowScrollbar}
        onWheel={handleShowScrollbar}
        className={scrollVisible ? 'scroll-visible' : ''}
        style={{ overflow: 'auto', height: 'calc(100vh - 75px)' }}
      >
        <Navbar ref={navbarRef} onFilter={filter} onFilterChange={setFilter} onAlert={isAlert} setOnAlert={setIsAlert} onAccept={isAccept} setOnAccept={setIsAccept} />
        <div className='content_header-2'>
          <h2 style={{ color: '#333' }}>{board?.categoryName || 'Yükleniyor...'}</h2>
          <button className={`task-filter_button filter_main_button`} onClick={() =>setTimeout(() => {setFilterClick(prev => !prev)}, 0)} ></button>
          <div className="mydropdown">
            <button className="mydropdown__button" onClick={(e) => {e.stopPropagation(); setIsOpen(!isOpen);}}>
              İndir
            </button>
                        {isOpen && (
              <ul className="mydropdown__list" ref={myDropRef} >
                {options.map((option) => (
                  <li
                    
                    key={option.value.toString()}
                    className="mydropdown__item"
                    onClick={() => {
                      setSelected(option.value);
                      setIsOpen(false);
                      handleTaskListDownload(event,option.value);
                    }}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>




                <div className={`task-filters-main ${filterClick ? 'expand' : ''}`} ref={filterRef}>
                  {filterClick &&
                  <div className='task-filters-main-wrapper'>
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

                        <div className='form-date-group-main'>
                          <label className='form-label'>Son Tarih</label>
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

                        <div className='form-date-group-main'>
                        <label className='form-label'>Oluşturulma Tarihi</label>
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

                        
                        <div className='form-date-group-main'>
                          <label className='form-label'>Son Güncellenme Tarihi</label>
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









        </div>
        <div className='content_header'>
          <h1 style={{ color: '#333' }}>{board?.categoryName || 'Yükleniyor...'}</h1>
        </div>

        <div className="task-list">
          <div className={isActive ? 'add-task-box-wrapper-active' : 'add-task-box-wrapper'} ref={addRef}>
            <div
              ref={followerRef}
              onClick={!isActive ? handleAddClick : undefined}
              className={isActive ? 'task-box' : 'add-task-box'}
              style={{ cursor: 'pointer' }}
            >
              {!isActive ? (
                <div className="add-symbol">Ekle</div>
              ) : (
                <form onSubmit={handleSubmit} className="task-form">
                  <label style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>Ekle</label>

                  <label className="form-label">Görev Adı
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={loading} className="form-input" />
                  </label>

                  <label className="form-label">Açıklama
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required disabled={loading} className="form-textarea" />
                  </label>

                  <label className="form-label">Öncelik
                    <select name="priority" value={formData.priority} onChange={handleChange} required disabled={loading} className="form-select">
                      <option value="Low">Düşük</option>
                      <option value="Medium">Orta</option>
                      <option value="High">Yüksek</option>
                    </select>
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} disabled={loading} className="form-checkbox" />
                    Aktif
                  </label>
                  <label className="form-label">Son Tarih
                    <input type="datetime-local" name="deadline" value={formData.deadline} onChange={handleChange} required disabled={loading} className="form-input" />
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
                      <button type="submit" disabled={loading} className="btn btn-submit">{loading ? 'Ekleniyor...' : 'Ekle'}</button>
                      <button type="button" onClick={handleCancel} disabled={loading} className="btn btn-cancel">İptal</button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
          {tasks.map((task, index) => (
            <Task
              key={task.id}
              task={task}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              isConfirmed={isAccept}
              taskDeleted={isTaskDeleted}
              onConfirmChange={setIsAccept}
              onAlertToggle={setIsAlert}
              index={index}
              moveTask={moveTask}
              setDragging={setDragging}
              setIsUploading={setIsUpload}
              setUploadingMessage={setUploadMessage}
              forceUploadingState={forceUploadState}
              setForceUploadingState={setForceUploadState}
              onComplatedTask={handelComplateTask}
              subTaskDeleting={subTaskDeleted}
              setSubTaskDeleting={setSubTaskDeleted}
              subTaskDragged={subTaskDragged}
              setSubTaskDragged={setSubTaskDragged}
            />
          ))}
        </div>

        {children}
        {(isDragging || subTaskDragged) && <TrashBin onDropTask={handleDeleteTask} onDropSubTask={setSubTaskDeleted} />}
      </main>
    </>
  );
}

export default MainContent;
