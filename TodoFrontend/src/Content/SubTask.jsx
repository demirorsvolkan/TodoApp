import { updateSubTask } from './Api/taskApi';
import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'SUBTASK';


function SubTask({ subTask, onDeleteSubtask, onUpdateSubtask, subTaskDeleted, index, moveSubTask, setDragging}) {
  const { token } = useAuth();

  const [update, setUpdate] = useState(new Date(subTask.updateTime).toLocaleDateString());
  const [isActive, setIsActive] = useState(subTask.active);
  const [showButton, setShowButton] = useState(subTask.active);
  const [editingSubTask, setEditingSubTask] = useState(false);
  const [detailClick, setDetailClick] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const updateRef = useRef();
  const menuRef = useRef();

  const [taskFormData, setTaskFormData] = useState({
    id: subTask.id,
    mainTaskId: subTask.mainTaskId,
    subTaskOrder:0,
    name: subTask.name,
    description: subTask.description,
    priority: subTask.priority,
    active: subTask.active,
    deadline: subTask.deadline ? new Date(subTask.deadline).toISOString() : '',
    creationTime: subTask.creationTime || new Date().toISOString(),
    updateTime: new Date().toISOString(),
  });

  const [, drop] = useDrop({
  accept: ItemType,
  hover(item, monitor) {
    if (!updateRef.current) return;

    const dragIndex = item.index;
    const hoverIndex = index;

    if (dragIndex === hoverIndex) return;

    const rect = updateRef.current.getBoundingClientRect();
    const hoverMiddleY = (rect.bottom - rect.top) / 2; // Y ekseninin ortası
    const hoverClientY = monitor.getClientOffset().y - rect.top; // mouse'un Y pozisyonu
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
    moveSubTask(dragIndex, hoverIndex);
    item.index = hoverIndex;
  },
});

const [{ isDragging }, drag] = useDrag({
  type: ItemType,
  item: { id: subTask.id, index, type: ItemType, mainTaskId:subTask.mainTaskId },
  collect: monitor => ({ isDragging: monitor.isDragging() }),
});

drag(drop(updateRef));

  useEffect(() => {
      setDragging(isDragging)
}, [isDragging]);

  const handleEdit = () => {
    setMenuOpen(false);
    setIsUpdating(true);
  };

  const handleUndoComplete = async () => {
    try {
      const updatedTaskData = {
        ...subTask,
        active: true,
        updateTime: new Date().toISOString(),
      };

      const data = await updateSubTask(token, updatedTaskData);
      setIsActive(true);
      setUpdate(new Date(data.updateTime).toLocaleDateString());
      setMenuOpen(false);
      setTimeout(() => setShowButton(true), 1000);
    } catch (error) {
      console.error('Tamamlama hatası:', error);
    }
  };

  const handleCancel = () => {
    setIsUpdating(false);
    setTaskFormData({
      id: subTask.id,
      mainTaskId: subTask.mainTaskId,
      subTaskOrder:0,
      name: subTask.name,
      description: subTask.description,
      priority: subTask.priority,
      active: isActive,
      deadline: subTask.deadline ? new Date(subTask.deadline).toISOString() : '',
      creationTime: subTask.creationTime || new Date().toISOString(),
      updateTime: new Date().toISOString(),
    });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaskFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const taskUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateToTask = {
        ...taskFormData,
        active: taskFormData.active,
        deadline: taskFormData.deadline ? new Date(taskFormData.deadline).toISOString() : '',
        updateTime: new Date().toISOString(),
        creationTime: subTask.creationTime || new Date().toISOString(),
      };

      await onUpdateSubtask(updateToTask);
      setIsActive(updateToTask.active);
      setIsUpdating(false);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const updatedTaskData = {
        ...subTask,
        active: false,
        updateTime: new Date().toISOString(),
      };

      const data = await updateSubTask(token, updatedTaskData);
      setIsActive(false);
      setUpdate(new Date(data.updateTime).toLocaleDateString());
      setTimeout(() => setShowButton(false), 1000);
    } catch (error) {
      console.error('Tamamlama hatası:', error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        (updateRef.current && !updateRef.current.contains(event.target)) &&
        (menuRef.current && !menuRef.current.contains(event.target))
      ) {
        setDetailClick(false);
        setMenuOpen(false);
        setIsUpdating(false);
      }
    }

    if (detailClick || menuOpen || isUpdating) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [detailClick, menuOpen, isUpdating]);

  function formatDeadline(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    const day = date.getDate();
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const showYear = year !== now.getFullYear();

    return showYear ? `${day} ${monthName} ${year}` : `${day} ${monthName}`;
  }

  function getDeadlineColor(dateString) {
    if (!dateString) return '';

    const deadline = new Date(dateString);
    const now = new Date();

    const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);

    if (diffDays <= 3) return 'sub-deadline-soon';
    if (diffDays <= 7) return 'sub-deadline-medium';

    return 'sub-deadline-normal';
  }

  return (
    <li className="subtask-box-li" ref={updateRef} style={{ opacity: isDragging ? 0 : 1}}>
      {!isUpdating ? (
        <div className={`subtask-box ${subTaskDeleted === subTask.id ? 'deleted' : ''}`}>
          {!isActive ? (
            <div className="overlay"></div> 
          ) : new Date(subTask.deadline) < new Date() ? (
            <div className="pass-overlay"></div> 
          ) : null}

          <div className="subtask-header" ref={menuRef}>
            <button
              className={`detail-button ${detailClick ? 'active' : ''}`}
              onClick={() => setDetailClick((prev) => !prev)}
            ></button>
            <div className="dropdown-trigger" onClick={() => setMenuOpen(!menuOpen)}>
              ...
            </div>

            {menuOpen && (
              <ul className="dropdown-list subtask">
                <li onClick={handleEdit}>Düzenle</li>
                {!isActive && <li onClick={handleUndoComplete}>Tamamlanmadı</li>}
                <li
                  onClick={() => {
                    onDeleteSubtask(subTask.id);
                    setMenuOpen(false);
                  }}
                >
                  Sil
                </li>
              </ul>
            )}

            <h4 className={`subtask-name ${detailClick ? 'expand' : ''}`}>{subTask.name}</h4>
          </div>

          <div className="subtask-content">
            <div>
              <p className={`subtask-description ${detailClick ? 'expand' : ''}`}>{subTask.description}</p>
              {detailClick && (
                <div className="dates">
                  <span>Oluşturulma Zamanı: {new Date(subTask.creationTime).toLocaleDateString('tr-TR')}</span>
                </div>
              )}
            </div>

            {showButton && (
              <button className="complete-button" onClick={handleComplete} disabled={!isActive}>
                {isActive ? '' : 'Tamamlandı'}
              </button>
            )}
          </div>

          <div className="subtask-footer">
            <div className="tags">
              <span
                className={`sub-status ${
                  isActive ? (new Date(subTask.deadline) < new Date() ? 'missed' : 'active') : 'completed'
                }`}
              >
                {isActive ? (new Date(subTask.deadline) < new Date() ? 'Kaçırıldı' : 'Aktif') : 'Tamamlandı'}
              </span>

              <span className={`sub-priority ${subTask.priority.toLowerCase()}`}>{(subTask.priority).toUpperCase()}</span>
              <span className={`sub-deadline ${getDeadlineColor(subTask.deadline)}`}>{formatDeadline(subTask.deadline)}</span>
            </div>

            <div className="dates">
              <span>
                Son Güncelleme:
                <br /> {update}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="subtask-box">
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
                checked={taskFormData.active}
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
        </div>
      )}
    </li>
  );
}

export default SubTask;
