import './index.css';

export default ({ content }: { content: string }) => {
  //   return (
  //     <iframe className="ck-content" content={content}>
  //       {/* <div dangerouslySetInnerHTML={{ __html: content }} className="ck-content" /> */}
  //     </iframe>
  //   );
  return <div dangerouslySetInnerHTML={{ __html: content }} className="ck-content" />;
};
