import React from 'react';
import { useDrop } from 'react-dnd';

const TrashBin = ({ onDropTask, onDropSubTask }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['TASK', 'SUBTASK'],
    drop: (item) => {
      if (item.type === 'TASK') {
        onDropTask && onDropTask(item.id);
      } else if (item.type === 'SUBTASK') {
        onDropSubTask && onDropSubTask({id:item.id,mainTaskId:item.mainTaskId});
      }else{
        console.log("dasdasdasd")
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60px',
        backgroundColor: isOver && canDrop ? '#BF381A' : 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.3s ease',
        pointerEvents: 'auto',
        zIndex: 1000,
      }}
    >
      <svg 
        width="30" 
        height="30" 
        fill={isOver && canDrop ? 'white' : 'gray'} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
      >
        <path d="M3 6h18v2H3V6zm2 3h14v12H5V9zm3 2v8h2v-8H8zm4 0v8h2v-8h-2z"/>
      </svg>
    </div>
  );
};

export default TrashBin;
