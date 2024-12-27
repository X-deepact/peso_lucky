import { formatMessage } from 'umi';

export default function FormattedMessage(
  this: any,
  props: { id: string; defaultMessage?: string },
  values?: any,
) {
  return formatMessage(
    {
      ...props,
      // defaultMessage: props.defaultMessage || props.id.split('.').pop() || '',
    },
    values,
  );
}
