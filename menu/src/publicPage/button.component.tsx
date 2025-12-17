import { Link } from 'react-router-dom'

export  function ButtonCategory({title,srcImg,path,...props}:any) {
    const classButton = props.classButton || '';
    const classText = props.classText || '';
    return(
       <div className={props.sizeClass+' p-4 '}>
            <Link 
                style={{ backgroundImage: `url(${srcImg.replaceAll(' ','_')})`}} 
                className={'block content-center rounded-md items-center justify-center object-cover h-40 bg-gray-300 bg-cover bg-center hover:bg-top bg-no-repeat '+ classButton} 
                to={path}
            >
                    <h2 className={classText}>{title}</h2>
        </Link>
        </div>
    );
}

