import Spinner from '@/widgets/loaders/Spinner'

const loading = () => {
  return (
    <div className='minh-screen flex justify-center items-center'>
        <Spinner size='lg'/>
    </div>
  )
}

export default loading