export const convertToHtml = (htmlString) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
};