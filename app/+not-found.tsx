import { Link, Stack} from 'expo-router';
import { Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
    <Link href={"/"}><Text>Go TO Home</Text></Link>
    </>
  );
}